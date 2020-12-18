import { Component, OnInit } from '@angular/core';
import { CameraService } from '../camera.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { addValidators, removeValidators } from '../../../utils/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	form: FormGroup;
	imagePath = '/assets/cactus.png'
	imageId: string;
	validationType: {} = {
		title: [ Validators.required ],
		comments: [ Validators.required ],
	}
	errorMessage: string;

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private router: Router) { }

	ngOnInit(): void {
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.imagePath = img.imageAsDataUrl
	  }

	  // Form
	  this.form = this.fb.group({
		title: this.fb.control('', [ Validators.required ]),
		comments: this.fb.control('', [ Validators.required ])
	  });
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
	}

	async share() {
		const formData = new FormData();
		formData.set('title', this.form.get('title').value);
		formData.set('comments', this.form.get('comments').value);
		formData.set('image-file', this.cameraSvc.getImage().imageData);
		try {
			let response = await this.cameraSvc.uploadPost(formData)
			this.imageId = response;
			this.form.reset();
			removeValidators(this.form);
			addValidators(this.form, this.validationType);
			this.imagePath = '/assets/cactus.png';
		}
		catch (err) {
			if (err.status === 401) {
				console.error(err.error);
				this.router.navigate(['']);
			};
		};
	};
};
