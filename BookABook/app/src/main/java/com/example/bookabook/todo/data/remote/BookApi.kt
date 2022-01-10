package com.example.bookabook.todo.data.remote

import com.example.bookabook.core.Api
import com.example.bookabook.todo.data.Book
import retrofit2.http.*

object BookApi {
    interface Service {
        @GET("/api/books")
        suspend fun find(): List<Book>

        @GET("/api/books/{id}")
        suspend fun read(@Path("id") bookId: Int): Book;

        @Headers("Content-Type: application/json")
        @POST("/api/books")
        suspend fun create(@Body book: Book): Book

        @Headers("Content-Type: application/json")
        @PUT("/api/books")
        suspend fun update(@Body book: Book): Book
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}