package com.example.bookabook.todo.books

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.bookabook.R
import com.example.bookabook.auth.data.AuthRepository
import com.example.bookabook.core.TAG
import com.example.bookabook.databinding.FragmentItemListBinding
import androidx.recyclerview.widget.DividerItemDecoration




class BookListFragment : Fragment() {
    private var _binding: FragmentItemListBinding? = null
    private lateinit var bookListAdapter: BookListAdapter
    private lateinit var booksModel: BookListViewModel
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.i(TAG, "onCreateView")
        _binding = FragmentItemListBinding.inflate(inflater, container, false)
        var recyclerView = R.id.list_item
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return;
        }
        setupBookList()
        binding.fab.setOnClickListener {
            Log.v(TAG, "add new book")
            findNavController().navigate(R.id.BookEditFragment)
        }
    }

    private fun setupBookList() {
        bookListAdapter = BookListAdapter(this)
        binding.itemList.adapter = bookListAdapter
        booksModel = ViewModelProvider(this).get(BookListViewModel::class.java)
        booksModel.books.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update books")
            bookListAdapter.books = value
        })
        booksModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })
        booksModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })
        booksModel.loadBooks()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        Log.i(TAG, "onDestroyView")
        _binding = null
    }
}