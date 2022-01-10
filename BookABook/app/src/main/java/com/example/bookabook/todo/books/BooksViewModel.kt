package com.example.bookabook.todo.books

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bookabook.todo.data.BookRepository
import com.example.bookabook.core.TAG
import com.example.bookabook.core.Result
import com.example.bookabook.todo.data.Book
import kotlinx.coroutines.launch

class BookListViewModel : ViewModel() {
    private val mutableBooks = MutableLiveData<List<Book>>().apply { value = emptyList() }
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val books: LiveData<List<Book>> = mutableBooks
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    fun createBook(position: Int): Unit {
        val list = mutableListOf<Book>()
        list.addAll(mutableBooks.value!!)
        list.add(Book(position, "Book " + position, "", "", "", ""))
        mutableBooks.value = list
    }

    fun loadBooks() {
        viewModelScope.launch {
            Log.v(TAG, "loadBooks...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = BookRepository.loadAll()) {
                is Result.Success -> {
                    Log.d(TAG, "loadBooks succeeded");
                    mutableBooks.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadBooks failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}
