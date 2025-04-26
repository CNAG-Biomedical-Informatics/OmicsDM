import React, { useRef, useEffect } from "react";
import {
  createJSONEditor
} from 'vanilla-jsoneditor'

const filterUnchangedProps = (props, prevProps) => {
  console.log("filterUnchangedProps", props, prevProps);
  return Object.fromEntries(
    Object.entries(props).filter((
      [key, value]) => value !== prevProps[key]
    )
  );
};

export default function JSONEditorWrapper({
  content, onChange, readOnly = false
}) {

  const props = {
    content,
    readOnly
  };

  if (onChange) {
    props.onChange = onChange;
  }

  // console.log("JSONEditorWrapper", props);

  console.log("JSONEditorWrapper", props);

  const refContainer = useRef(null);
  const refEditor = useRef(null);
  const refPrevProps = useRef(props);

  useEffect(() => {
    // create editor
    console.group("in create editor");
    console.log("create editor", refContainer.current);
    console.log("props", props);
    console.groupEnd();
    // console.groupEnd();
    // refEditor.current = new JSONEditor({
    //   target: refContainer.current,
    //   props: {}
    // });

    refEditor.current = createJSONEditor({
      target: refContainer.current,
      props
    });


    return () => {
      // destroy editor
      if (!refEditor.current) {
        return;
      }
      console.log("destroy editor");
      refEditor.current.destroy();
      refEditor.current = null;
    };
  }, []);

  // update props
  useEffect(() => {

    console.group("UpdateProps");
    console.log("in update props");
    console.log("refEditor", refEditor.current);
    console.log("props", props);
    console.log("refPrevProps", refPrevProps.current);
    console.groupEnd();

    if (!refEditor.current) {
      return;
    }

    const changedProps = filterUnchangedProps(props, refPrevProps.current);
    console.log("changedProps", changedProps);
    refEditor.current.updateProps(changedProps);
    refPrevProps.current = props;
  }, [props]);

  return <div className="vanilla-jsoneditor-react" ref={refContainer} />;
};