package com.faculta.androidlabma.ui

import android.content.Context
import android.content.SharedPreferences
import android.net.ConnectivityManager
import android.net.Network
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import androidx.work.*
import com.faculta.androidlabma.data.db.AppDatabase
import com.faculta.androidlabma.data.db.dao.ItemDAO
import com.faculta.androidlabma.databinding.ActivityMainBinding
import com.faculta.androidlabma.helpers.Constants
import com.faculta.androidlabma.helpers.NetworkUtils
import com.faculta.androidlabma.worker.MyWorker
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {


    private lateinit var binding: ActivityMainBinding
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var db: AppDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        sharedPreferences = getPreferences(Context.MODE_PRIVATE)
        setContentView(binding.root)

        db = AppDatabase.getInstance(this)

        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val inputData = Data.Builder()
            .putString(Constants.TOKEN_KEY, getToken())
            .build()

        val myWork = PeriodicWorkRequestBuilder<MyWorker>(5, TimeUnit.SECONDS) // TODO set to 15 minutes
            .setConstraints(constraints)
            .setInputData(inputData)
            .build()
        WorkManager.getInstance(this).enqueue(myWork)

        val connectivityManager = this.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        connectivityManager.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                runOnUiThread {
                    binding.noInternetTextView.visibility = View.GONE
                    NetworkUtils.isInternetConnected = true
                    binding.noInternetTextView.isSelected = false
                }
            }

            override fun onLost(network: Network) {
                runOnUiThread {
                    binding.noInternetTextView.visibility = View.VISIBLE
                    NetworkUtils.isInternetConnected = false
                    binding.noInternetTextView.isSelected = true
                }
            }
        })
    }

    fun saveToken(token: String) {
        sharedPreferences.edit().putString(Constants.TOKEN_KEY, token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString(Constants.TOKEN_KEY, "")
    }

    fun getDb(): ItemDAO {
        return db.itemDAO()
    }
}