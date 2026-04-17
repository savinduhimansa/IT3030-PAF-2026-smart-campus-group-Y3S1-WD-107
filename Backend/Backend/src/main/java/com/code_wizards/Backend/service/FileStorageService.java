package com.code_wizards.Backend.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FileStorageService {
    List<String> saveFiles(MultipartFile[] files);
}
