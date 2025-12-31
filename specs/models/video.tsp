namespace VideoFrameExtractor;

@doc("Video file information")
model VideoInfo {
  @doc("Unique identifier for the video")
  id: string;

  @doc("Original filename")
  filename: string;

  @doc("MIME type of the video")
  mimeType: string;

  @doc("File size in bytes")
  size: int64;

  @doc("Video duration in seconds")
  duration: float64;

  @doc("Video width in pixels")
  width: int32;

  @doc("Video height in pixels")
  height: int32;

  @doc("Frame rate (fps)")
  frameRate: float64;

  @doc("Upload timestamp")
  uploadedAt: utcDateTime;
}

@doc("Video upload request")
model VideoUploadRequest {
  @doc("Video file (multipart/form-data)")
  file: bytes;
}

@doc("Video upload response")
model VideoUploadResponse {
  @doc("Uploaded video information")
  video: VideoInfo;
}
