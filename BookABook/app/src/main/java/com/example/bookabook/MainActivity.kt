package com.example.bookabook

import ConnectivityLiveData
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.*
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import com.example.bookabook.core.TAG
import com.example.bookabook.databinding.ActivityMainBinding


class MainActivity : AppCompatActivity(), SensorEventListener {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    private lateinit var sensorManager: SensorManager
    private var light: Sensor? = null
    private lateinit var connectivityManager: ConnectivityManager
    private lateinit var connectivityLiveData: ConnectivityLiveData

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        appBarConfiguration = AppBarConfiguration(navController.graph)

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        light = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)

        connectivityManager = getSystemService(android.net.ConnectivityManager::class.java)
        connectivityLiveData = ConnectivityLiveData(connectivityManager, this)
        connectivityLiveData.observe(this, {
            Log.d(TAG, "connectivityLiveData $it")
        })
        setupActionBarWithNavController(navController, appBarConfiguration)
    }

    override fun onSensorChanged(event: SensorEvent) {
        val lux = event.values[0]
        val textView = findViewById<TextView>(R.id.textViewLightSensor);
        textView.text = "Light has changed to: $lux";
        Log.d(TAG, "onSensorChanged $lux");

    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        Log.d(TAG, "onAccuracyChanged $accuracy");
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_settings -> true
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        val navController = findNavController(R.id.nav_host_fragment_content_main)
        return navController.navigateUp(appBarConfiguration)
                || super.onSupportNavigateUp()
    }

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onStart() {
        super.onStart()
        Log.d(TAG, "isOnline ${isOnline()}")
        connectivityManager.registerDefaultNetworkCallback(networkCallback)
    }

    val networkCallback = @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            Log.d(TAG, "The default network is now: " + network)
        }

        override fun onLost(network: Network) {
            Log.d(
                TAG,
                "The application no longer has a default network. The last default network was " + network
            )
        }

        override fun onCapabilitiesChanged(
            network: Network,
            networkCapabilities: NetworkCapabilities
        ) {
            Log.d(TAG, "The default network changed capabilities: " + networkCapabilities)
        }

        override fun onLinkPropertiesChanged(network: Network, linkProperties: LinkProperties) {
            Log.d(TAG, "The default network changed link properties: " + linkProperties)
        }
    }

    fun isOnline(): Boolean {
        val connMgr = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val networkInfo: NetworkInfo? = connMgr.activeNetworkInfo
        return networkInfo?.isConnected == true
    }

    override fun onResume() {
        super.onResume()
        light?.also {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
    }
}