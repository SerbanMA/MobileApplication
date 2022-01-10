import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkInfo
import android.os.Build
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.lifecycle.LiveData
import com.example.bookabook.MainActivity

class ConnectivityLiveData internal constructor(private val connectivityManager: ConnectivityManager, private val context: Context)
    : LiveData<Boolean>() {

    private val networkCallback = @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            Toast.makeText(context, "Network is available!", Toast.LENGTH_LONG).show();
            postValue(true)
        }
        override fun onLost(network: Network) {
            Toast.makeText(context, "Network is lost!", Toast.LENGTH_LONG).show();
            postValue(false)
        }
    }

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onActive() {
        super.onActive()
        val activeNetwork: NetworkInfo? = connectivityManager.activeNetworkInfo
        postValue(activeNetwork?.isConnectedOrConnecting == true)
        connectivityManager.registerDefaultNetworkCallback(networkCallback)
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    override fun onInactive() {
        super.onInactive()
        connectivityManager.unregisterNetworkCallback(networkCallback)
    }
}