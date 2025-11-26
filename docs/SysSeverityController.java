package vn.mobi.trolytrucao.sys_severity.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.mobi.trolytrucao.common.CommonResponse;
import vn.mobi.trolytrucao.common.Constants;
import vn.mobi.trolytrucao.component.AbstractService;
import vn.mobi.trolytrucao.sys_severity.dto.SysSeverityRequest;
import vn.mobi.trolytrucao.sys_severity.service.SysSeverityService;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sys-severity")
@RequiredArgsConstructor
@Tag(name = "System Severity Configuration", description = "API quản lý cấu hình mức độ cảnh báo")
public class SysSeverityController extends AbstractService {

    @Autowired
    private SysSeverityService sysSeverityService;

    @SneakyThrows
    @GetMapping("")
    @Operation(summary = "Lấy danh sách severity", description = "Lấy danh sách cấu hình mức độ cảnh báo có phân trang")
    public ResponseEntity<CommonResponse<Object>> getAllSeverities(
            @Parameter(description = "Số trang", example = "1")
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @Parameter(description = "Số items/trang", example = "10")
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Hướng sắp xếp: asc/desc")
            @RequestParam(name = "sort_dir", required = false, defaultValue = "desc") String sortDir,
            @Parameter(description = "Trường sắp xếp")
            @RequestParam(name = "sort_key", required = false, defaultValue = "priorityLevel") String sortKey
    ) {
        ObjectNode data = sysSeverityService.getAllSeverities(page, limit, keyword, sortDir, sortKey);
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(data).message(Constants.SUCCESS).statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @SneakyThrows
    @GetMapping("/{code}")
    @Operation(summary = "Lấy severity theo code")
    public ResponseEntity<CommonResponse<Object>> getSeverityByCode(
            @PathVariable String code) {
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(sysSeverityService.getSeverityByCode(code)).message(Constants.SUCCESS).statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy danh sách severity đang active")
    public ResponseEntity<CommonResponse<Object>> getActiveSeverities() {
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(sysSeverityService.getActiveSeverities()).message(Constants.SUCCESS).statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @PostMapping("/create")
    @Operation(summary = "Tạo mới severity")
    public ResponseEntity<CommonResponse<Object>> createSeverity(@RequestBody SysSeverityRequest request) {
        validate(request);
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(sysSeverityService.createSeverity(request)).message(Constants.SUCCESS).statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @PostMapping("/edit")
    @Operation(summary = "Cập nhật severity")
    public ResponseEntity<CommonResponse<Object>> editSeverity(
            @RequestParam String id,
            @RequestBody SysSeverityRequest request) {
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(sysSeverityService.editSeverity(id, request)).message(Constants.SUCCESS).statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @PostMapping("/delete")
    @Operation(summary = "Xóa severity")
    public ResponseEntity<CommonResponse<Object>> deleteSeverities(@RequestParam List<String> ids) {
        sysSeverityService.deleteSeverities(ids);
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(null).message(Constants.SUCCESS).statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @PostMapping("/copy")
    @Operation(summary = "Sao chép severity")
    public ResponseEntity<CommonResponse<Object>> copySeverity(@RequestParam String id) {
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(sysSeverityService.copySeverity(id)).message("Copied successfully").statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel")
    public ResponseEntity<byte[]> exportToExcel() throws Exception {
        byte[] excelBytes = sysSeverityService.exportToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "sys_severity_export.xlsx");
        headers.setContentLength(excelBytes.length);
        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/import")
    @Operation(summary = "Nhập từ Excel")
    public ResponseEntity<CommonResponse<Object>> importFromFile(@RequestParam("file") MultipartFile file) throws Exception {
        List<?> imported = sysSeverityService.importFromFile(file);
        return new ResponseEntity<>(CommonResponse.builder()
                .success(true).data(imported).message("Imported " + imported.size() + " items").statusCode(Constants.STATUS_API_SUCCESS).build(), HttpStatus.OK);
    }

    @GetMapping("/template")
    @Operation(summary = "Tải template Excel")
    public ResponseEntity<byte[]> downloadTemplate() throws Exception {
        byte[] templateBytes = sysSeverityService.getExcelTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "sys_severity_template.xlsx");
        headers.setContentLength(templateBytes.length);
        return new ResponseEntity<>(templateBytes, headers, HttpStatus.OK);
    }
}
