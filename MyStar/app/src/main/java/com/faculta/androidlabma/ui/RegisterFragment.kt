package com.faculta.androidlabma.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.faculta.androidlabma.databinding.FragmentRegisterBinding
import com.faculta.androidlabma.helpers.showToast
import com.faculta.androidlabma.ui.viewmodel.RegisterViewModel

class RegisterFragment: Fragment() {

    private lateinit var binding: FragmentRegisterBinding
    private val viewModel = RegisterViewModel()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.registerButton.setOnClickListener {
            val name = binding.nameTIET.text.toString()
            val username = binding.usernameInputTIET.text.toString()
            val password = binding.passwordInputTIET.text.toString()
            viewModel.register(name, username, password)
        }

        viewModel.errorMessageLiveData.observe(viewLifecycleOwner) {
            requireContext().showToast(it)
        }

        viewModel.canNavigateToNextDestination.observe(viewLifecycleOwner) {
            requireActivity().onBackPressed()
        }
    }
}