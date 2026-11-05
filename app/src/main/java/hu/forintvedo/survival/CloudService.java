package hu.forintvedo.survival;
public interface CloudService {
    interface Listener { void event(String kind, String data); }
    void signIn();
    void save(String json);
    void load();
}
