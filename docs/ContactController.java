package vn.mobi.trolytrucao.contact.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
import vn.mobi.trolytrucao.contact.dto.ContactRequest;
import vn.mobi.trolytrucao.contact.service.ContactService;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Tag(name = "Contact Management", description = "API endpoints for managing contacts")
public class ContactController extends AbstractService {

    @Autowired
    ContactService contactService;

    @SneakyThrows
    @GetMapping("")
    @Operation(summary = "Get all contacts", description = "Retrieve paginated list of contacts with optional filtering and sorting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contacts retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid parameters",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> getAllContacts(
            @Parameter(description = "Page number (1-based)", example = "1")
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @Parameter(description = "Search keyword for filtering", example = "Nguyen")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Sort direction (asc/desc)", example = "desc")
            @RequestParam(name = "sortDir", required = false, defaultValue = "desc") String sortDir,
            @Parameter(description = "Field to sort by", example = "id")
            @RequestParam(name = "sortKey", required = false, defaultValue = "id") String sortKey
    ) {
        ObjectNode data = contactService.getAllContacts(page, limit, keyword, sortDir, sortKey);

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(data)
                .message(Constants.SUCCESS)
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @SneakyThrows
    @GetMapping("/filter")
    @Operation(summary = "Filter contacts", description = "Get contacts with advanced filtering options")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Filtered results retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid parameters",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> filterContacts(
            @Parameter(description = "Page number (1-based)", example = "1")
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @Parameter(description = "Filter by full name", example = "Nguyen")
            @RequestParam(required = false) String fullName,
            @Parameter(description = "Filter by department ID", example = "1")
            @RequestParam(required = false) Long departmentId,
            @Parameter(description = "Filter by email", example = "nguyen@company.com")
            @RequestParam(required = false) String email,
            @Parameter(description = "Filter by phone", example = "0901234567")
            @RequestParam(required = false) String phone,
            @Parameter(description = "Filter by active status", example = "true")
            @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Sort direction (asc/desc)", example = "desc")
            @RequestParam(name = "sortDir", required = false, defaultValue = "desc") String sortDir,
            @Parameter(description = "Field to sort by", example = "id")
            @RequestParam(name = "sortKey", required = false, defaultValue = "id") String sortKey
    ) {
        ObjectNode data = contactService.filterContacts(page, limit, fullName, departmentId, email, phone, isActive, sortDir, sortKey);

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(data)
                .message(Constants.SUCCESS)
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @PostMapping("/create")
    @Operation(summary = "Create contact", description = "Create a new contact")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contact created successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid contact data",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> createContact(@RequestBody ContactRequest request) {
        validate(request);

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(contactService.createContact(request))
                .message(Constants.SUCCESS)
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @PostMapping("/edit")
    @Operation(summary = "Update contact", description = "Update existing contact")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contact updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "404", description = "Contact not found",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "400", description = "Invalid contact data",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> updateContact(
            @Parameter(description = "Contact ID", example = "1", required = true)
            @RequestParam Long id,
            @RequestBody ContactRequest request) {

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(contactService.updateContact(id, request))
                .message(Constants.SUCCESS)
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete single contact", description = "Delete a single contact by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contact deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "404", description = "Contact not found",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> deleteContact(
            @Parameter(description = "Contact ID to delete", example = "1", required = true)
            @PathVariable Long id) {
        contactService.deleteContact(id);

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(null)
                .message(Constants.SUCCESS)
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @PostMapping("/delete")
    @Operation(summary = "Delete multiple contacts", description = "Delete one or more contacts by their IDs")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contacts deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "404", description = "One or more contacts not found",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> deleteContacts(
            @Parameter(description = "List of contact IDs to delete", required = true)
            @RequestParam List<Long> ids) {
        contactService.deleteContacts(ids);

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(null)
                .message(Constants.SUCCESS)
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @PostMapping("/copy/{id}")
    @Operation(summary = "Copy contact", description = "Create a copy of an existing contact")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contact copied successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "404", description = "Contact not found",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> copyContact(
            @Parameter(description = "Contact ID to copy", example = "1", required = true)
            @PathVariable Long id) {

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(contactService.copyContact(id))
                .message("Contact copied successfully")
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @GetMapping("/export")
    @Operation(summary = "Export contacts to Excel", description = "Export all contacts to an Excel file")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Excel file generated successfully",
                    content = @Content(mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
    })
    public ResponseEntity<byte[]> exportToExcel() throws Exception {
        byte[] excelBytes = contactService.exportToExcel();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "contacts_export.xlsx");
        headers.setContentLength(excelBytes.length);

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/import")
    @Operation(summary = "Import contacts from file", description = "Import contacts from Excel, CSV, or TXT file")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contacts imported successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = CommonResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file format or data",
                    content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<CommonResponse<Object>> importFromFile(
            @Parameter(description = "File to import (.xlsx, .xls, .csv, .txt)", required = true)
            @RequestParam("file") MultipartFile file) throws Exception {

        List<?> importedContacts = contactService.importFromFile(file);

        CommonResponse<Object> commonResponse = CommonResponse.builder()
                .success(true)
                .data(importedContacts)
                .message("Imported " + importedContacts.size() + " contacts successfully")
                .statusCode(Constants.STATUS_API_SUCCESS)
                .build();
        return new ResponseEntity<>(commonResponse, HttpStatus.OK);
    }

    @GetMapping("/template")
    @Operation(summary = "Download Excel template", description = "Download a sample Excel template for importing contacts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Template file generated successfully",
                    content = @Content(mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
    })
    public ResponseEntity<byte[]> downloadTemplate() throws Exception {
        byte[] templateBytes = contactService.getExcelTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "contacts_template.xlsx");
        headers.setContentLength(templateBytes.length);

        return new ResponseEntity<>(templateBytes, headers, HttpStatus.OK);
    }
}
