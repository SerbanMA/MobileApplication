package com.faculta.androidlabma.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.faculta.androidlabma.databinding.FragmentObjectListBinding
import com.faculta.androidlabma.helpers.showToast
import com.faculta.androidlabma.ui.adapter.ObjectListAdapter
import com.faculta.androidlabma.ui.viewmodel.ObjectListViewModel

class ObjectListFragment: Fragment() {
    private lateinit var binding: FragmentObjectListBinding
    private val viewModel = ObjectListViewModel()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentObjectListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {


        binding.addButton.setOnClickListener {
            val directions = ObjectListFragmentDirections.actionObjectListFragmentToCreateUpdateObjectFragment()
            findNavController().navigate(directions)
        }

        viewModel.setDb((requireActivity() as MainActivity).getDb())

        binding.goBackButton.setOnClickListener {
            findNavController().popBackStack()
        }

        viewModel.getItems((requireActivity() as MainActivity).getToken()?: "")

        viewModel.itemsListLiveData.observe(viewLifecycleOwner) {
            binding.recyclerView.layoutManager = LinearLayoutManager(context)
            binding.recyclerView.adapter = ObjectListAdapter(requireContext(), it) { item ->
                val directions = ObjectListFragmentDirections.actionObjectListFragmentToCreateUpdateObjectFragment(false, item)
                findNavController().navigate(directions)
            }
        }

        viewModel.errorMessageLiveData.observe(viewLifecycleOwner) {
            requireContext().showToast(it)
        }

    }
}