package com.example.bookabook.todo.data

data class Book(
    val id: Int,
    var name: String,
    var author: String,
    var publishDate: String,
    var isBooked: String,
    var image: String,
) {
    override fun toString(): String = "$id, $name, $author, $publishDate" + if (isBooked == "true") " yes" else " no"
}
