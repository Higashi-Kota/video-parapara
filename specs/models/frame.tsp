namespace VideoFrameExtractor;

@doc("Extracted frame information")
model FrameInfo {
  @doc("Frame number (0-indexed)")
  frameNumber: int32;

  @doc("Timestamp in seconds")
  timestamp: float64;

  @doc("Frame image URL")
  url: string;

  @doc("Image width in pixels")
  width: int32;

  @doc("Image height in pixels")
  height: int32;

  @doc("Image format (e.g., 'png', 'jpeg')")
  format: string;
}

@doc("Frame extraction options")
model ExtractionOptions {
  @doc("Interval between frames in seconds (default: 1.0)")
  interval?: float64 = 1.0;

  @doc("Output image format")
  format?: ImageFormat = ImageFormat.png;

  @doc("Image quality (1-100, for jpeg)")
  quality?: int32 = 90;

  @doc("Maximum width (maintains aspect ratio)")
  maxWidth?: int32;

  @doc("Maximum height (maintains aspect ratio)")
  maxHeight?: int32;
}

@doc("Supported image formats")
enum ImageFormat {
  png,
  jpeg,
  webp,
}

@doc("Extraction job status")
enum ExtractionStatus {
  pending,
  processing,
  completed,
  failed,
}

@doc("Extraction job information")
model ExtractionJob {
  @doc("Job ID")
  id: string;

  @doc("Video ID")
  videoId: string;

  @doc("Job status")
  status: ExtractionStatus;

  @doc("Extraction options used")
  options: ExtractionOptions;

  @doc("Total frames to extract")
  totalFrames?: int32;

  @doc("Frames extracted so far")
  extractedFrames?: int32;

  @doc("Extracted frames (available when completed)")
  frames?: FrameInfo[];

  @doc("Error message (if failed)")
  error?: string;

  @doc("Job creation timestamp")
  createdAt: utcDateTime;

  @doc("Job completion timestamp")
  completedAt?: utcDateTime;
}
