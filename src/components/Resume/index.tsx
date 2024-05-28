"use client";

import { BiSolidError } from "react-icons/bi";
import { MdCloudDownload } from "react-icons/md";
import { JSX, Suspense, useEffect, useRef, useState } from "react";

const styles = {
  object: "w-full h-full flex items-center justify-center",
  downloadDiv:
    "w-full h-full flex flex-col items-center justify-center gap-16 -mt-28",
  h3: "text-center text-2xl md:text-3xl xl:text-4xl font-bold mt-8",
  p: "p-3 rounded bg-gray-600 text-gray-200 hover:bg-green-600 font-medium flex hover:font-bold drop-shadow-lg -mt-12",
  downloadSpan: "flex flex-col items-center justify-center gap-2 pr-2 ",
  cloudIcon: "w-6 h-6",
  errorIcon:
    "text-red-500 text-8xl sm:text-9xl md:text-10xl lg:text-11xl xl:text-12 mt-8",
};

function isMobileBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|ipad|iphone|ipod/i.test(userAgent);
}

export const ResumeComponent = (): JSX.Element => {
  const [canShowPdf, setCanShowPdf] = useState(true);
  const [resize, setResize] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pdfRef = useRef<HTMLEmbedElement | null>(null);

  useEffect(() => {
    if (!mounted) setMounted(true);

    const handleResize = () => {
      setTimeout(() => {
        setResize(true);
        setTimeout(() => {
          setResize(false);
        }, 1);
      }, 0);
    };

    isMobileBrowser() && setCanShowPdf(false);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return canShowPdf ? (
    <Suspense fallback={<div>Loading...</div>}>
      <object className={styles.object}>
        {!resize && (
          <embed
            ref={pdfRef}
            aria-label="resume"
            src="./documents/resume.pdf"
            type="application/pdf"
          />
        )}
      </object>
    </Suspense>
  ) : (
    <div className={styles.downloadDiv}>
      <BiSolidError className={styles.errorIcon} />
      <h3 className={styles.h3}>Oh No! Your browser does not support PDFs!</h3>

      <a className={styles.p} href="./documents/resume.pdf" target="_blank">
        <span className={styles.downloadSpan}>
          <MdCloudDownload className={styles.cloudIcon} />
        </span>{" "}
        Download the PDF instead.
      </a>
    </div>
  );
};
