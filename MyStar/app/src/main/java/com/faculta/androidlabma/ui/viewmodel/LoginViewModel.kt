package com.faculta.androidlabma.ui.viewmodel

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.faculta.androidlabma.data.models.LoginRequest
import com.faculta.androidlabma.data.models.LoginResponse
import com.faculta.androidlabma.data.network.ApiService
import com.faculta.androidlabma.ui.MainActivity
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginViewModel: ViewModel() {

    private var apiService: ApiService = ApiService.create()
    val errorMessageLiveData = MutableLiveData<String>()
    val canNavigateToNextDestination = MutableLiveData<Boolean>()

    fun login(username: String, password: String, activity: MainActivity) {
        viewModelScope.launch {
            apiService.login(LoginRequest(username, password)).enqueue(object : Callback<LoginResponse> {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    when {
                        response.code() == 201 -> {
                            activity.saveToken(response.body()?.token?: "")
                            canNavigateToNextDestination.value = true
                        }
                        response.code() == 400 -> {
                            errorMessageLiveData.value = "Wrong username or password."
                        }
                        else -> {
                            errorMessageLiveData.value = "There was an error."
                        }
                    }
                }

                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    Log.d("LoginViewModel", t.message.toString())
                }
            })
        }
    }
}