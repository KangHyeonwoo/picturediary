package com.picture.diary.picture.service.impl;

import com.picture.diary.extract.data.PictureFile;
import com.picture.diary.extract.data.PictureMetadata;
import com.picture.diary.extract.data.PicturePathProperties;
import com.picture.diary.extract.service.PictureExtractorService;
import com.picture.diary.picture.data.PictureDto;
import com.picture.diary.picture.data.PictureEntity;
import com.picture.diary.picture.repository.PictureRepository;
import com.picture.diary.picture.service.PictureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PictureServiceImpl implements PictureService {

    private final PicturePathProperties picturePathProperties;
    private final PictureExtractorService pictureExtractorService;
    private final PictureRepository pictureRepository;

    public PictureDto findByPictureId(long pictureId) {
    	PictureEntity pictureEntity = pictureRepository.findByPictureId(pictureId);
    	
    	return pictureEntity.toDto();
    }
    
    public List<PictureDto> pictureExtract() {
        String path = picturePathProperties.getFromPath();
        //1. 사진파일 목록 조회
        List<PictureFile> pictureFileList = pictureExtractorService.getPictureList(path);
        
        List<PictureDto> savedPictureList = this.findPictureList();
        
        List<PictureEntity> pictureEntityList = pictureFileList.stream()
        		.filter(pictureFile -> !pictureExtractorService.doubleCheck(pictureFile, savedPictureList))
                .filter(pictureFile -> {
                	
                    //2. 메타데이터 추출
                    PictureMetadata metadata = pictureExtractorService.getPictureMetadata(pictureFile);
                    pictureFile.addMetadata(metadata);
                    
                    //3. 디렉토리 이동
                    return pictureExtractorService.movePictureFile(pictureFile);
                })
                //4. DB에 저장하기 위해 entity 로 형변환
                .map(pictureFile -> pictureFile.toEntity())
                .collect(Collectors.toList());
        //5. DB에 저장
        List<PictureEntity> savedList = pictureRepository.saveAll(pictureEntityList);
        List<PictureDto> savedDtoList = savedList.stream()
                .map(PictureEntity::toDto)
                .collect(Collectors.toList());

        return savedDtoList;
    }

    public List<PictureDto> findPictureList() {

        List<PictureDto> pictureDtoList = pictureRepository.findAll().stream()
                .map(PictureEntity::toDto)
                .collect(Collectors.toList());

        return pictureDtoList;
    }

}