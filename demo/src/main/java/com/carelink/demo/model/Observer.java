package com.carelink.demo.model;

/**
 * Interface du pattern Observer.
 * Les classes implémentant cette interface sont notifiées
 * lorsqu'un événement survient.
 */
public interface Observer {

    /**
     * Reçoit un message lors d'une notification.
     *
     * @param message information transmise par le sujet observé
     */
    void update(String message);
}
