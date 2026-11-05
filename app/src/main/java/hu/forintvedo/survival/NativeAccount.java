package hu.forintvedo.survival;
import android.app.Activity;
import android.content.Intent;
import android.webkit.JavascriptInterface;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

/** File access always uses Android's user-controlled document picker. */
public final class NativeAccount {
    private final Activity activity;
    private final CloudService.Listener listener;
    private CloudService cloud;
    private String pendingExport;
    public NativeAccount(Activity a, CloudService.Listener l) {
        activity=a;listener=l;
        try {cloud=(CloudService)Class.forName("hu.forintvedo.survival.PlayGamesCloud").getConstructor(Activity.class,CloudService.Listener.class).newInstance(a,l);}catch(Exception ignored){}
    }
    @JavascriptInterface public boolean cloudAvailable(){return cloud!=null;}
    @JavascriptInterface public void signIn(){activity.runOnUiThread(()->{if(cloud!=null)cloud.signIn();else listener.event("error","A Google-mentés nincs konfigurálva ebben a kiadásban.");});}
    @JavascriptInterface public void saveCloud(final String json){if(json==null||json.length()>2000000)return;activity.runOnUiThread(()->{if(cloud!=null)cloud.save(json);});}
    @JavascriptInterface public void loadCloud(){activity.runOnUiThread(()->{if(cloud!=null)cloud.load();});}
    @JavascriptInterface public void exportSave(final String json){if(json==null||json.length()>2000000)return;activity.runOnUiThread(()->{pendingExport=json;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("application/json");i.putExtra(Intent.EXTRA_TITLE,"RiftBramble-mentes.json");try{activity.startActivityForResult(i,810);}catch(Exception e){listener.event("error","A fájlválasztó nem nyitható meg.");}});}
    @JavascriptInterface public void importSave(){activity.runOnUiThread(()->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");try{activity.startActivityForResult(i,811);}catch(Exception e){listener.event("error","A fájlválasztó nem nyitható meg.");}});}
    public void result(int request,int result,Intent data){if(request!=810&&request!=811)return;if(result!=Activity.RESULT_OK||data==null||data.getData()==null){pendingExport=null;listener.event("cancelled","A fájlművelet megszakítva.");return;}try{
        if(request==810){if(pendingExport==null)throw new Exception();try(OutputStream out=activity.getContentResolver().openOutputStream(data.getData(),"wt")){if(out==null)throw new Exception();out.write(pendingExport.getBytes(StandardCharsets.UTF_8));}pendingExport=null;listener.event("exported","");}
        else{ByteArrayOutputStream out=new ByteArrayOutputStream();try(InputStream in=activity.getContentResolver().openInputStream(data.getData())){if(in==null)throw new Exception();byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1){if(out.size()+n>2000000)throw new Exception();out.write(b,0,n);}}listener.event("imported",new String(out.toByteArray(),StandardCharsets.UTF_8));}
    }catch(Exception e){pendingExport=null;listener.event("error","A mentésfájl nem olvasható vagy nem írható (maximum 2 MB).");}}
}
