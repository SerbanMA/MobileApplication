package com.faculta.androidlabma.worker

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.faculta.androidlabma.data.db.AppDatabase
import com.faculta.androidlabma.data.models.Item
import com.faculta.androidlabma.data.network.ApiService
import com.faculta.androidlabma.helpers.Constants
import com.faculta.androidlabma.helpers.Convertor
import kotlinx.coroutines.*
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MyWorker(
    val context: Context,
    val workerParams: WorkerParameters
) : Worker(context, workerParams) {
    override fun doWork(): Result {
        val db = AppDatabase.getInstance(context).itemDAO()
        val apiService = ApiService.create()
        val token = inputData.getString(Constants.TOKEN_KEY)

        val itemsList = db.getAllUnsynced()
        itemsList.forEach {
            if (it._id == null) {
                apiService.addItem("Bearer $token", Convertor.convertFromItemDbToItem(it)).enqueue(object:
                    Callback<Item> {
                    override fun onResponse(call: Call<Item>, response: Response<Item>) {
                        val newItem = response.body()?: Item()
                        it.isSynced = true
                        it._id = newItem._id
                        CoroutineScope(Dispatchers.IO).launch {
                            db.update(it)
                        }
                        Log.d("MyWorker", "Movie sync successful!")
                    }

                    override fun onFailure(call: Call<Item>, t: Throwable) {
                        Log.d("MyWorker", "Movie sync failed: $t")
                    }
                })
            } else {
                val id = it._id
                apiService.updateItem("Bearer $token", Convertor.convertFromItemDbToItem(it), id?: "").enqueue(object:
                    Callback<Item> {
                    override fun onResponse(call: Call<Item>, response: Response<Item>) {
                        it.isSynced = true
                        CoroutineScope(Dispatchers.IO).launch {
                            db.update(it)
                        }
                        Log.d("MyWorker", "Movie sync successful!")
                    }

                    override fun onFailure(call: Call<Item>, t: Throwable) {
                        Log.d("MyWorker", "Movie sync failed: $t")
                    }
                })
            }
        }

        Log.d("MyWorker", "Syncing with the server...")
        return Result.retry() // TODO: return Result.success()
    }
}

