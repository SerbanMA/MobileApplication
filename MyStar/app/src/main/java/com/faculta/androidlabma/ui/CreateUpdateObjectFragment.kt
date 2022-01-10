package com.faculta.androidlabma.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.navArgs
import com.faculta.androidlabma.data.db.model.ItemDB
import com.faculta.androidlabma.databinding.FragmentCreateUpdateObjectBinding
import com.faculta.androidlabma.helpers.showToast
import com.faculta.androidlabma.ui.viewmodel.CreateUpdateObjectViewModel
import java.util.*

class CreateUpdateObjectFragment: Fragment() {
    private lateinit var binding: FragmentCreateUpdateObjectBinding
    private val args:  CreateUpdateObjectFragmentArgs by navArgs()

    private val viewModel = CreateUpdateObjectViewModel()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentCreateUpdateObjectBinding.inflate(inflater, container, false)
        return binding.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewModel.setDb((requireActivity() as MainActivity).getDb())

        binding.saveButton.setOnClickListener {
            val name = binding.nameInputTIET.text.toString()
            var rating = 0;
            if (binding.ratingTIET.text.toString() != "")
                rating = binding.ratingTIET.text.toString().toInt()
            val favourite = binding.favouriteCheckBox.isChecked
            if (args.isCreate) {
                viewModel.createItem((requireActivity() as MainActivity).getToken()?: "", ItemDB(name = name, date = Date(System.currentTimeMillis()), rating = rating, favourite = favourite))
            } else {
                viewModel.updateItem((requireActivity() as MainActivity).getToken()?: "", ItemDB(id = args.objectValue?.id?: 0, _id = args.objectValue?._id?: "", name = name, date = Date(System.currentTimeMillis()), rating = rating, favourite = favourite), args.objectValue?._id?: "")
            }
        }

        if (!args.isCreate) {
            binding.createUpdateTitleTextView.text = "- Update -"

            val item = args.objectValue?: ItemDB()
            binding.nameInputTIET.setText(item.name?: "")
            binding.ratingTIET.setText(item.rating?.toString()?: "")
            binding.favouriteCheckBox.isChecked = item.favourite?: false

            binding.deleteButton.visibility = View.VISIBLE
            binding.deleteButton.setOnClickListener {
                viewModel.deleteItem((requireActivity() as MainActivity).getToken()?: "", item._id?: "")
            }
        } else {
            binding.createUpdateTitleTextView.text = "- Create -"

            binding.deleteButton.visibility = View.GONE
        }

        viewModel.canNavigateToNextDestination.observe(viewLifecycleOwner) {
            requireActivity().onBackPressed()
        }

        viewModel.preNavigationMessage.observe(viewLifecycleOwner) {
            requireContext().showToast(it)
        }

        viewModel.errorMessageLiveData.observe(viewLifecycleOwner) {
            requireContext().showToast(it)
        }
    }
}