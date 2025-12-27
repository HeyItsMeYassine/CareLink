package com.carelink.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Contrôleur responsable de l'affichage de la page d'accueil.
 */
@Controller
public class HomeController {

    /**
     * Redirige l'utilisateur vers la page principale de l'application.
     *
     * @return la vue "index"
     */
    @GetMapping("/")
    public String home() {
        return "index";
    }
}
