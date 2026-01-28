package com.doconsult.server.controller;

import com.doconsult.server.dto.response.ApiResponse;
import com.doconsult.server.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload APIs")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "documents") String type) {
        String filePath = fileStorageService.storeFile(file, type);
        Map<String, String> response = new HashMap<>();
        response.put("filePath", filePath);
        response.put("fileName", file.getOriginalFilename());
        return ResponseEntity.ok(ApiResponse.success("File uploaded", response));
    }

    @GetMapping("/{type}/{fileName}")
    @Operation(summary = "Download a file")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String type,
            @PathVariable String fileName) {
        byte[] fileContent = fileStorageService.loadFile(type + "/" + fileName);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileContent);
    }

    @DeleteMapping("/{type}/{fileName}")
    @Operation(summary = "Delete a file")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable String type,
            @PathVariable String fileName) {
        fileStorageService.deleteFile(type + "/" + fileName);
        return ResponseEntity.ok(ApiResponse.success("File deleted", null));
    }
}
