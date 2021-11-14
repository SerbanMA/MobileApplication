package ro.ubb.sharednotes.controller;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint(value="")
public class WebSocketEndpoint {

    private Session session;
    private static Set<WebSocketEndpoint> chatEndpoints
            = new CopyOnWriteArraySet<>();
    private static ArrayList<String> users = new ArrayList<>();

    @OnOpen
    public void onOpen(Session session) throws IOException {

        this.session = session;
        chatEndpoints.add(this);
        users.add(session.getId());
    }

//    @OnMessage
//    public void onMessage(Session session, Message message)
//            throws IOException {
//
//        message.setFrom(users.get(session.getId()));
//        broadcast(message);
//    }
//
//    @OnClose
//    public void onClose(Session session) throws IOException {
//
//        chatEndpoints.remove(this);
//        Message message = new Message();
//        message.setFrom(users.get(session.getId()));
//        message.setContent("Disconnected!");
//        broadcast(message);
//    }
//
//    @OnError
//    public void onError(Session session, Throwable throwable) {
//        // Do error handling here
//    }
//
//    private static void broadcast(Message message)
//            throws IOException, EncodeException {
//
//        chatEndpoints.forEach(endpoint -> {
//            synchronized (endpoint) {
//                try {
//                    endpoint.session.getBasicRemote().
//                            sendObject(message);
//                } catch (IOException | EncodeException e) {
//                    e.printStackTrace();
//                }
//            }
//        });
//    }
}
