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

class CreateUpdateObjectViewModel: ViewModel() {
    private var apiService: ApiService = ApiService.create()
    val errorMessageLiveData = MutableLiveData<String>()
    val canNavigateToNextDestination = MutableLiveData<Boolean>()
    val preNavigationMessage = MutableLiveData<String>()
    private lateinit var db: ItemDAO

    fun setDb(itemDAO: ItemDAO) {
        db = itemDAO
    }

    fun createItem(token: String, item: ItemDB) {
        viewModelScope.launch {
            if (NetworkUtils.isInternetConnected) {
                apiService.addItem("Bearer $token", Convertor.convertFromItemDbToItem(item)).enqueue(object : Callback<Item> {
                    override fun onResponse(call: Call<Item>, response: Response<Item>) {
                        when (response.code()) {
                            201 -> {
                                canNavigateToNextDestination.value = true
                                preNavigationMessage.value = "Create successful!"
                            }
                            400 -> {
                                errorMessageLiveData.value = "Bad request."
                            }
                            else -> {
                                errorMessageLiveData.value = "There was an error."
                                Log.d("CreateUpdateViewModel", response.message().toString())
                            }
                        }
                    }

                    override fun onFailure(call: Call<Item>, t: Throwable) {
                        Log.d("CreateUpdateViewModel", t.message.toString())
                    }
                })
            } else {
                viewModelScope.launch(Dispatchers.IO) {
                    item.isSynced = false
                    db.addAll(item)
                    canNavigateToNextDestination.postValue(true)
                    preNavigationMessage.postValue("There is no internet. Sync with the server later...")
                }

            }
        }
    }

    fun updateItem(token: String, item: ItemDB, id: String) {
        viewModelScope.launch {
            if (NetworkUtils.isInternetConnected) {
                apiService.updateItem("Bearer $token", Convertor.convertFromItemDbToItem(item), id).enqueue(object : Callback<Item> {
                    override fun onFailure(call: Call<Item>, t: Throwable) {
                        Log.d("CreateUpdateViewModel", t.message.toString())
                    }

                    override fun onResponse(call: Call<Item>, response: Response<Item>) {
                        when (response.code()) {
                            200 -> {
                                canNavigateToNextDestination.value = true
                                preNavigationMessage.value = "Update successful!"
                            }
                            400 -> {
                                errorMessageLiveData.value = "Bad request."
                            }
                            405 -> {
                                errorMessageLiveData.value = "Resource does not exist anymore."
                            }
                            else -> {
                                errorMessageLiveData.value = "There was an error."
                                Log.d("CreateUpdateViewModel", response.message().toString())
                            }
                        }
                    }

                })
            } else {
                viewModelScope.launch(Dispatchers.IO) {
                    item.isSynced = false
                    db.update(item)
                    canNavigateToNextDestination.postValue(true)
                    preNavigationMessage.postValue("There is no internet. Sync with the server later....")
                }
            }
        }
    }

    fun deleteItem(token: String, id: String) {
        viewModelScope.launch {
            if (NetworkUtils.isInternetConnected) {
                apiService.deleteItem("Bearer $token", id).enqueue(object : Callback<Unit> {
                    override fun onResponse(call: Call<Unit>, response: Response<Unit>) {
                        when (response.code()) {
                            204 -> {
                                canNavigateToNextDestination.value = true
                                preNavigationMessage.value = "Delete successful!"
                            }
                            403 -> {
                                errorMessageLiveData.value = "Forbidden."
                            }
                            else -> {
                                errorMessageLiveData.value = "There was an error."
                                Log.d("CreateUpdateViewModel", response.message().toString())
                            }
                        }
                    }

                    override fun onFailure(call: Call<Unit>, t: Throwable) {
                        Log.d("CreateUpdateViewModel", t.message.toString())
                    }
                })
            } else {
                preNavigationMessage.value = "Delete cannot be done because you are not connected to the internet."
            }
        }
    }
}