package com.picture.diary.common.user.data;

import com.picture.diary.auth.login.data.LoginType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@AllArgsConstructor
@ToString
@Getter
public class User implements UserDetails {

    private String userId;

    private String password;

    private String username;

    private Role role;

    private LoginType loginType;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorityList = new ArrayList<>();
        authorityList.add(new SimpleGrantedAuthority(loginType.name()));
        authorityList.add(new SimpleGrantedAuthority(role.name()));

        return authorityList;
    }

    @Override
    public String getPassword() {
        return "{bcrypt}" + this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
