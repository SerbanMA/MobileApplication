package com.faculta.androidlabma.ui.viewmodel

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.faculta.androidlabma.data.db.dao.ItemDAO
import com.faculta.androidlabma.data.db.model.ItemDB
import com.faculta.androidlabma.data.models.Item
import com.faculta.androidlabma.data.network.ApiService
import com.faculta.androidlabma.helpers.Convertor
import com.faculta.androidlabma.helpers.NetworkUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ObjectListViewModel() : ViewModel() {
    private val apiService: ApiService = ApiService.create()
    val itemsListLiveData = MutableLiveData<List<ItemDB>>()
    val errorMessageLiveData = MutableLiveData<String>()
    private lateinit var db: ItemDAO

    fun setDb(itemDAO: ItemDAO) {
        db = itemDAO
    }


    fun getItems(token: String) {
        viewModelScope.launch {
            if (NetworkUtils.isInternetConnected) {
                apiService.getItems("Bearer $token")
                    .enqueue(object : Callback<List<Item>> {
                        override fun onFailure(call: Call<List<Item>>, t: Throwable) {
                            errorMessageLiveData.value = t.message
                            Log.d("ObjectListViewModel", "$t")
                        }

                        override fun onResponse(
                            call: Call<List<Item>>,
                            response: Response<List<Item>>
                        ) {
                            if (response.code() == 200) {
                                viewModelScope.launch(Dispatchers.IO) {
                                    db.clearAll()
                                    db.addAll(*Convertor.convertFromItemToItemDb(response.body()?: listOf(), true).toTypedArray())
                                    itemsListLiveData.postValue(db.getAll())
                                }
                            } else {
                                errorMessageLiveData.value = "There was an error."
                            }
                        }
                    })
            } else {
                viewModelScope.launch(Dispatchers.IO) {
                    itemsListLiveData.postValue(db.getAll())
                }
            }

        }
    }

}