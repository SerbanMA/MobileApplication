package com.example.bookabook.todo.book

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

class BookEditViewModel : ViewModel() {
    private val mutableBook = MutableLiveData<Book>().apply { value = Book(0, "", "", "", "", "") }
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val book: LiveData<Book> = mutableBook
    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    fun loadBook(bookId: Int) {
        viewModelScope.launch {
            Log.i(TAG, "loadBook...")
            mutableFetching.value = true
            mutableException.value = null
            when (val result = BookRepository.load(bookId)) {
                is Result.Success -> {
                    Log.d(TAG, "loadBook succeeded");
                    mutableBook.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadBook failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableFetching.value = false
        }
    }

    fun saveOrUpdateBook(title: String, author: String, publishDate: String, isBooked: String) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateBook...");
            val book = mutableBook.value ?: return@launch
            book.name = title
            book.author = author
            book.publishDate = publishDate
            book.isBooked = isBooked
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Book>
            if (book.id > 0) {
                result = BookRepository.update(book)
            } else {
                result = BookRepository.save(book)
            }
            when (result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateBook succeeded");
                    mutableBook.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateBook failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }
}
