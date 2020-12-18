export interface CameraImage {
	imageAsDataUrl: string
	imageData: Blob
}

export interface AuthStatus {
	status: string,
	message: string,
}

export interface User {
	username: string,
	password: string,
}
