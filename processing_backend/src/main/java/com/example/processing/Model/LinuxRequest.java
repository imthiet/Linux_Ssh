package com.example.processing.Model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinuxRequest {

	private String username;
    private String password;
    private String ip;
    private String command;
    
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getIp() {
		return ip;
	}
	public void setIp(String ip) {
		this.ip = ip;
	}
	public String getCommand() {
		return command;
	}
	public void setCommand(String command) {
		this.command = command;
	}
    
    
    
    
}
