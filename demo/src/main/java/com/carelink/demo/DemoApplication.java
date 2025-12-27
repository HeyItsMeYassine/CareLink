package com.carelink.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application Spring Boot CareLink.
 */
@SpringBootApplication
public class DemoApplication {

	/**
	 * Démarre l'application et initialise le contexte Spring.
	 */
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}
