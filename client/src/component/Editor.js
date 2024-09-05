import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript"; // Correct path for JavaScript mode
import "codemirror/addon/edit/closetag"; // Correct path for the closetag addon
import "codemirror/addon/edit/closebrackets"; // Correct path for the closebrackets addon
import "codemirror/lib/codemirror.css"; // Import CodeMirror CSS
import "codemirror/theme/dracula.css"; // Import theme

import CodeMirror from "codemirror";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realTimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current = editor;
      editor.setSize(null, "100%");
      editorRef.current.on("change", (instance, changes) => {
        // console.log(`changes`, instance, changes);
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit("code-change", {
            roomId,
            code,
          });
        }
      });
    };

    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code-change", ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off("code-change");
    };
  }, [socketRef.current]);

  return (
    <div style={{ height: "600%" }}>
      <textarea id="realTimeEditor"></textarea>
    </div>
  );
}

export default Editor;
