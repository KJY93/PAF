import {Injectable} from "@angular/core";
import {CameraImage} from './models';
import {HttpClient} from '@angular/common/http'

@Injectable()
export class CameraService {

	BASE_URL = '/api';
	constructor(private http: HttpClient) {}

	image: CameraImage  = null

	clear() {
		this.image = null
	}

	getImage(): CameraImage {
		return this.image
	}

	hasImage(): boolean {
		return (this.image != null)
	}

	async uploadPost(formData: FormData): Promise<any> {
		try {
			let response = await this.http.post<any>(`${this.BASE_URL}/upload`, formData).toPromise();
			return response;
		}
		catch(err) {
			return Promise.reject(err);
		};
	};
};