package com.picture.diary.common.jwt;

import com.picture.diary.login.data.LoginType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Base64;
import java.util.Date;
import java.util.List;

//@see : https://velog.io/@jkijki12/Spirng-Security-Jwt-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0

/**
 * JWT 객체 관리 Component
 */
@RequiredArgsConstructor
@Component
public class JwtTokenProvider {

    private String key = "projectKey";

    private long tokenValidTime = 30 * 60 * 100L;

    private final UserDetailsService userDetailsService;
    private final JwtRepository jwtRepository;

    @PostConstruct
    protected void init() {
        key = Base64.getEncoder().encodeToString(key.getBytes());
    }

    /**
     * Create JWT Token
     * @param loginType
     * @param userId
     * @param roles
     * @return Jwt Access Token
     */
    public String createToken(LoginType loginType, String userId, List<String> roles) {
        String userPk = this.createUserPk(loginType, userId);
        String accessToken = createAccessToken(userPk, roles);
        String refreshToken = createRefreshToken(accessToken);

        JwtEntity jwtEntity = new JwtEntity(accessToken, refreshToken);

        jwtRepository.save(jwtEntity);

        return jwtEntity.getAccessToken();
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getUserPk(token));

        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    //token 에서 사용자 인증 정보 조회
    public String getUserPk(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Request의 Header에서 token 값을 가져온다. "Authorization" : "TOKEN값'
    public String resolveToken(HttpServletRequest request) {
        return request.getHeader("ACCESS-TOKEN");
    }

    // 토큰의 유효성 + 만료일자 확인
    public JwtEntity getValidateResponseToken(String accessToken) {
        JwtEntity response = new JwtEntity();

        try {
            //accessToken 검사
            final Jws<Claims> claims = Jwts.parser().setSigningKey(key).parseClaimsJws(accessToken);
            if(claims.getBody().getExpiration().before(new Date())) {
                response.setValidate(true);
            }

            //accessToken 이 만료됐다면 refreshToken 검사
            String refreshToken = jwtRepository.findRefreshTokenByAccessToken(accessToken);
            final Jws<Claims> refreshClams = Jwts.parser().setSigningKey(key).parseClaimsJws(refreshToken);
            if(refreshClams.getBody().getExpiration().before(new Date())) {
                response.setNeedRefresh(true);
                response.setValidate(true);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return response;
    }

    public void setRefreshToken(HttpServletResponse response, JwtEntity jwtEntity) {
        String refreshToken = this.createAccessToken(jwtEntity.getUserPk(), jwtEntity.getRoles());

        response.addHeader("ACCESS-TOKEN", refreshToken);
    }

    private String createAccessToken(String userPk, List<String> roles) {
        //JWT payload 에 저장되는 정보 단위, 여기서 사용자를 식별하는 값을 넣는다.
        Claims claims = Jwts.claims().setSubject(userPk);
        claims.put("roles", roles);
        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + tokenValidTime))    //set Expire Time
                .signWith(SignatureAlgorithm.HS256, userPk)                 //Hashing user id
                .compact();
    }

    private String createRefreshToken(String accessToken) {
        Date now = new Date();

        return Jwts.builder()
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + tokenValidTime))    //set Expire Time
                .signWith(SignatureAlgorithm.HS256, accessToken)            //Hashing user id
                .compact();
    }

    //TODO 메서드 수정 필요 임시로 만들어 놓음
    private String createUserPk(LoginType loginType, String userId) {
        String loginTypeStr = loginType.toString();

        return loginTypeStr + ":" + userId;
    }

}