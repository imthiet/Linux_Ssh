package com.example.processing.Service;

import com.example.processing.Model.LinuxRequest;

import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.connection.channel.direct.Session;
import net.schmizz.sshj.transport.verification.PromiscuousVerifier;
import net.schmizz.sshj.userauth.method.AuthPassword;
import net.schmizz.sshj.userauth.password.PasswordUtils;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;


@Service
public class RemoteLinuxService {

	 public Map<String, Object> runProcessCheck(LinuxRequest request) {
	        Map<String, Object> response = new HashMap<>();

	        try (SSHClient ssh = new SSHClient()) {
	        	ssh.addHostKeyVerifier(new PromiscuousVerifier());


	            ssh.connect(request.getIp());
	            ssh.authPassword(request.getUsername(), request.getPassword());

	            try (Session session = ssh.startSession()) {
	                Session.Command cmd = session.exec("ps aux");
	                BufferedReader reader = new BufferedReader(new InputStreamReader(cmd.getInputStream()));
	                StringBuilder output = new StringBuilder();
	                String line;

	                while ((line = reader.readLine()) != null) {
	                    output.append(line).append("\n");
	                }

	                cmd.join(); // Wait for command to finish

	                response.put("success", true);
	                response.put("output", output.toString());
	            }

	        } catch (Exception e) {
	            response.put("success", false);
	            response.put("error", e.getMessage());
	        }

	        return response;
	    }
}