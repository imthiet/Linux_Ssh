package com.example.processing.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.processing.Model.LinuxRequest;
import com.example.processing.Service.RemoteLinuxConfigService;
import com.example.processing.Service.RemoteLinuxService;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class Process_Controller {

    @Autowired
    private RemoteLinuxService remoteService;

    
    @Autowired
    private RemoteLinuxConfigService remoteLinuxConfigService;
   
    
    @PostMapping("/check-process")
    public Map<String, Object> checkProcess(@RequestBody LinuxRequest request) {
        return remoteService.runProcessCheck(request);
    }
    
    @PostMapping("/check-config")
    public Map<String, Object> checkConfig(@RequestBody LinuxRequest request) {
        return remoteLinuxConfigService.getSystemConfig(request);
    }

}
