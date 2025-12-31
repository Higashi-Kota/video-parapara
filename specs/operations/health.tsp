import "@typespec/http";

using TypeSpec.Http;

namespace VideoFrameExtractor;

@route("/health")
namespace Health {
  @doc("Health check endpoint")
  @get
  op check(): {
    status: "ok";
  };
}
