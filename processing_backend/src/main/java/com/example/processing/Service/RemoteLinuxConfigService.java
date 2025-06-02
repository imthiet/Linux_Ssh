package com.example.processing.Service;

import com.example.processing.Model.LinuxRequest;

import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.connection.channel.direct.Session;
import net.schmizz.sshj.transport.verification.PromiscuousVerifier;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@Service
public class RemoteLinuxConfigService {

    public Map<String, Object> getSystemConfig(LinuxRequest request) {
        Map<String, Object> response = new HashMap<>();

        try (SSHClient ssh = new SSHClient()) {
            ssh.addHostKeyVerifier(new PromiscuousVerifier());

            ssh.connect(request.getIp());
            ssh.authPassword(request.getUsername(), request.getPassword());

            try (Session session = ssh.startSession()) {
                // Chuỗi lệnh lấy CPU info, RAM info, Disk info
                String command = "echo '--- CPU Info ---'; lscpu; " +
                                 "echo '--- Memory Info ---'; free -h; " +
                                 "echo '--- Disk Info ---'; df -h /";

                Session.Command cmd = session.exec(command);

                BufferedReader reader = new BufferedReader(new InputStreamReader(cmd.getInputStream()));
                StringBuilder output = new StringBuilder();
                String line;

                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }

                cmd.join(); // chờ lệnh chạy xong

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
