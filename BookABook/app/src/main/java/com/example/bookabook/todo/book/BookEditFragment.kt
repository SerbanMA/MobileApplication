package com.example.bookabook.todo.book

import android.app.DatePickerDialog
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.DatePicker
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.bookabook.R
import com.example.bookabook.core.TAG
import com.example.bookabook.databinding.FragmentItemEditBinding
import java.text.SimpleDateFormat
import java.util.*

class BookEditFragment : Fragment() {
    companion object {
        const val ITEM_ID = "ITEM_ID"
    }

    private lateinit var viewModel: BookEditViewModel
    private var bookId: String? = null

    private var _binding: FragmentItemEditBinding? = null

    private val binding get() = _binding!!

    var button_date: Button? = null
    var textview_date: TextView? = null
    var cal = Calendar.getInstance()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.i(TAG, "onCreateView")
        arguments?.let {
            if (it.containsKey(ITEM_ID)) {
                bookId = it.getString(ITEM_ID)
            }
        }
        _binding = FragmentItemEditBinding.inflate(inflater, container, false)
        textview_date = binding.textViewDate1
        button_date = binding.buttonDate1

        textview_date!!.text = "--/--/----"

        val dateSetListener = object : DatePickerDialog.OnDateSetListener {
            override fun onDateSet(view: DatePicker, year: Int, monthOfYear: Int,
                                   dayOfMonth: Int) {
                cal.set(Calendar.YEAR, year)
                cal.set(Calendar.MONTH, monthOfYear)
                cal.set(Calendar.DAY_OF_MONTH, dayOfMonth)
                updateDateInView()
            }
        }

        // when you click on the button, show DatePickerDialog that is set with OnDateSetListener
        button_date!!.setOnClickListener(object : View.OnClickListener {
            override fun onClick(view: View) {
                context?.let {
                    DatePickerDialog(
                        it,
                        dateSetListener,
                        // set DatePickerDialog to point to today's date when it loads up
                        cal.get(Calendar.YEAR),
                        cal.get(Calendar.MONTH),
                        cal.get(Calendar.DAY_OF_MONTH)).show()
                }
                view.startAnimation(AnimationUtils.loadAnimation(context, R.anim.milkshake));
            }

        })

        return binding.root
    }

    private fun updateDateInView() {
        val myFormat = "yyyy-MM-dd" // mention the format you need
        val sdf = SimpleDateFormat(myFormat, Locale.ENGLISH)
        textview_date!!.text = sdf.format(cal.getTime())
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        setupViewModel()
        binding.fab.setOnClickListener {
            Log.v(TAG, "save book")
            viewModel.saveOrUpdateBook(binding.itemTitle.text.toString(), binding.itemAuthor.text.toString(), binding.textViewDate1.text.toString(), binding.checkBooked.isChecked.toString())
        }
       //binding.itemText.setText(bookId.toString())
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(BookEditViewModel::class.java)
        viewModel.book.observe(viewLifecycleOwner, { book ->
            Log.v(TAG, "update books")
            println(book)
            binding.itemTitle.setText(book.name)
            binding.itemAuthor.setText(book.author)
            binding.textViewDate1.text = book.publishDate
            binding.checkBooked.isChecked = (book.isBooked == "true")
        })
        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            binding.progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })
        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })
        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigateUp()
            }
        })
        val id = bookId
        if (id != null) {
            viewModel.loadBook(id.toInt())
        }
    }
}