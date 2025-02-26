import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const MarkdownRenderer = ({ markdown }) => {
    const markdownRef = useRef(null);

    // Effect to wrap elements with class 'katex-display'
    useEffect(() => {
        if (markdownRef.current) {
            const katexDisplays = markdownRef.current.getElementsByClassName('katex-display');
            Array.from(katexDisplays).forEach((display) => {
                const wrapper = document.createElement('div');
                wrapper.style.textAlign = 'center';
                wrapper.style.maxWidth = "100px";
                wrapper.style.overflowX = 'auto';
                display.parentNode.insertBefore(wrapper, display);
                wrapper.appendChild(display);
            });
        }
    }, [markdown]); // Run this effect when markdown changes

    return (
        <div ref={markdownRef}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, gfm]}
                rehypePlugins={[rehypeKatex]}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
