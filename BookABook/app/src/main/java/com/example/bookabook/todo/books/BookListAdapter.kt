package com.example.bookabook.todo.books

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.bookabook.R
import com.example.bookabook.core.TAG
import com.example.bookabook.todo.data.Book
import com.example.bookabook.todo.book.BookEditFragment

class BookListAdapter(
    private val fragment: Fragment,
) : RecyclerView.Adapter<BookListAdapter.ViewHolder>() {

    var books = emptyList<Book>()
        set(value) {
            field = value
            notifyDataSetChanged();
        }

    private var onBookClick: View.OnClickListener = View.OnClickListener { view ->
        val book = view.tag as Book
        println(book)
        fragment.findNavController().navigate(R.id.BookEditFragment, Bundle().apply {
            putString(BookEditFragment.ITEM_ID, book.id.toString())
        })
    };

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_item, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")
        val book = books[position]
        holder.textView.text = book.id.toString() + ". \"" + book.name + "\" by " + book.author + "\n Published on: " + book.publishDate + if (book.isBooked == "true") "\n It isn't available" else "\n It is available"
        holder.itemView.tag = book
        holder.itemView.setOnClickListener(onBookClick)
    }

    override fun getItemCount() = books.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView

        init {
            textView = view.findViewById(R.id.text)
        }
    }
}
