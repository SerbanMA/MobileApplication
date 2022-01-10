package com.faculta.androidlabma.ui.viewmodel

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.faculta.androidlabma.data.models.RegisterRequest
import com.faculta.androidlabma.data.network.ApiService
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterViewModel: ViewModel() {
    private var apiService: ApiService = ApiService.create()
    val errorMessageLiveData = MutableLiveData<String>()
    val canNavigateToNextDestination = MutableLiveData<Boolean>()

    fun register(name: String, username: String, password: String) {
        viewModelScope.launch {
            apiService.register(RegisterRequest(name, username, password))
                .enqueue(object : Callback<Unit> {
                    override fun onResponse(call: Call<Unit>, response: Response<Unit>) {
                        when (response.code()) {
                            201 -> {
                                canNavigateToNextDestination.value = true
                            }
                            else -> {
                                errorMessageLiveData.value = "There was a problem"
                            }
                        }
                    }

                    override fun onFailure(call: Call<Unit>, t: Throwable) {
                        Log.d("RegisterViewModel", "$t")
                    }

                })
        }
    }
}