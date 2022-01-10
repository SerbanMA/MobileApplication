package com.example.bookabook.todo.data

import android.util.Log
import com.example.bookabook.core.TAG
import com.example.bookabook.core.Result
import com.example.bookabook.todo.data.remote.BookApi

object BookRepository {
    private var cachedBooks: MutableList<Book>? = null;

    suspend fun loadAll(): Result<List<Book>> {
        if (cachedBooks != null) {
            Log.v(TAG, "loadAll - return cached books")
            return Result.Success(cachedBooks as List<Book>);
        }
        try {
            Log.v(TAG, "loadAll - started")
            val books = BookApi.service.find()
            Log.v(TAG, "loadAll - succeeded")
            cachedBooks = mutableListOf()
            cachedBooks?.addAll(books)
            return Result.Success(cachedBooks as List<Book>)
        } catch (e: Exception) {
            Log.w(TAG, "loadAll - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun load(bookId: Int): Result<Book> {
        val book = cachedBooks?.find { it.id == bookId }
        if (book != null) {
            Log.v(TAG, "load - return cached book")
            return Result.Success(book)
        }
        try {
            Log.v(TAG, "load - started")
            val bookRead = BookApi.service.read(bookId)
            Log.v(TAG, "load - succeeded")
            return Result.Success(bookRead)
        } catch (e: Exception) {
            Log.w(TAG, "load - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun save(book: Book): Result<Book> {
        try {
            Log.v(TAG, "save - started")
            val createdBook = BookApi.service.create(book)
            Log.v(TAG, "save - succeeded")
            cachedBooks?.add(createdBook)
            return Result.Success(createdBook)
        } catch (e: Exception) {
            Log.w(TAG, "save - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun update(book: Book): Result<Book> {
        try {
            Log.v(TAG, "update - started")
            val updatedBook = BookApi.service.update(book)
            val index = cachedBooks?.indexOfFirst { it.id == book.id }
            if (index != null) {
                cachedBooks?.set(index, updatedBook)
            }
            Log.v(TAG, "update - succeeded")
            return Result.Success(updatedBook)
        } catch (e: Exception) {
            Log.v(TAG, "update - failed")
            return Result.Error(e)
        }
    }
}