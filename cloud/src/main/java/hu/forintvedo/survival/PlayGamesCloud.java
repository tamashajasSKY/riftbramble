package hu.forintvedo.survival;
import android.app.Activity;
import android.app.AlertDialog;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.SnapshotsClient;
import com.google.android.gms.games.snapshot.Snapshot;
import com.google.android.gms.games.snapshot.SnapshotMetadataChange;
import com.google.android.gms.tasks.Task;
import java.nio.charset.StandardCharsets;

/** Optional PGS v2 adapter; built only with a configured game project. */
public final class PlayGamesCloud implements CloudService {
    private final Activity activity;private final Listener listener;private boolean authenticated,busy;
    public PlayGamesCloud(Activity a,Listener l){activity=a;listener=l;PlayGamesSdk.initialize(a);}
    public void signIn(){PlayGames.getGamesSignInClient(activity).signIn().addOnSuccessListener(r->{authenticated=r.isAuthenticated();listener.event(authenticated?"signed":"error",authenticated?"":"A Google-belépés nem sikerült.");}).addOnFailureListener(e->error("A Google-belépés nem sikerült. Ellenőrizd a hálózatot és a kiadói beállítást."));}
    public void save(String json){open(json);}
    public void load(){open(null);}
    private void error(String text){busy=false;listener.event("error",text);}
    private void open(String json){if(!authenticated){error("Előbb jelentkezz be.");return;}if(busy){error("Már folyamatban van egy felhőművelet.");return;}busy=true;SnapshotsClient client=PlayGames.getSnapshotsClient(activity);resolve(client,client.open("full-profile-v1",json!=null,SnapshotsClient.RESOLUTION_POLICY_MANUAL),json,0);}
    private void resolve(SnapshotsClient client,Task<SnapshotsClient.DataOrConflict<Snapshot>> task,String json,int depth){task.addOnFailureListener(e->error("A felhőmentés nem érhető el, vagy még nincs mentés. A helyi állás megmaradt.")).addOnSuccessListener(result->{
        if(result.isConflict()){if(depth>=5){error("Többszörös mentésütközés. Próbáld újra később.");return;}SnapshotsClient.SnapshotConflict conflict=result.getConflict();Snapshot left=conflict.getSnapshot(),right=conflict.getConflictingSnapshot();String[] options={"1. "+left.getMetadata().getDescription(),"2. "+right.getMetadata().getDescription()};new AlertDialog.Builder(activity).setTitle("Válassz felhőmentést").setItems(options,(dialog,which)->resolve(client,client.resolveConflict(conflict.getConflictId(),which==0?left:right),json,depth+1)).setOnCancelListener(d->{client.discardAndClose(left);client.discardAndClose(right);error("A mentésütközés feloldása megszakítva.");}).show();return;}
        Snapshot snapshot=result.getData();if(snapshot==null){error("Üres felhőválasz.");return;}try{if(json==null){byte[] bytes=snapshot.getSnapshotContents().readFully();client.discardAndClose(snapshot);busy=false;if(bytes.length==0){error("Még nincs felhőmentés.");return;}listener.event("loaded",new String(bytes,StandardCharsets.UTF_8));}else{byte[] bytes=json.getBytes(StandardCharsets.UTF_8);if(bytes.length>2000000)throw new Exception();snapshot.getSnapshotContents().writeBytes(bytes);String desc="Teljes állás - "+new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm",java.util.Locale.ROOT).format(new java.util.Date());client.commitAndClose(snapshot,new SnapshotMetadataChange.Builder().setDescription(desc).build()).addOnSuccessListener(m->{busy=false;listener.event("saved","");}).addOnFailureListener(e->error("A felhőbe mentés nem sikerült. A helyi állás megmaradt."));}}catch(Exception e){client.discardAndClose(snapshot);error("A felhőmentés adatai nem olvashatók.");}
    });}
}
