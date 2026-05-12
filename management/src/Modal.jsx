import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

/*
  Reusable accessible Modal component.

  Props:
    - isOpen: boolean - whether modal is visible
    - onClose: function - called when modal requests to close
    - title: string|node - optional title shown in header (for accessibility)
    - children: node - modal body
    - size: "sm" | "md" | "lg" - controls width (default "md")
    - className: string - additional classes applied to modal container
*/

const MODAL_SIZES = {
  sm: "minWidthSm",
  md: "minWidthMd",
  lg: "minWidthLg",
};

const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const containerBase = {
  backgroundColor: "#fff",
  borderRadius: 8,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const sizeStyles = {
  sm: { width: "360px" },
  md: { width: "720px" },
  lg: { width: "1024px" },
};

const headerStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e6e6e6",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const bodyStyle = {
  padding: 20,
};

const closeButtonStyle = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  lineHeight: 1,
};

function Modal({ isOpen, onClose, title, children, size = "md", className = "" }) {
  const modalRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save last active element to restore focus when modal closes
    lastActiveElementRef.current = document.activeElement;

    // Prevent body scroll while modal open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus to the modal container
    if (modalRef.current) {
      const focusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable || modalRef.current).focus();
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose && onClose();
      } else if (e.key === "Tab") {
        // Basic focus trap
        const focusableEls = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (!firstEl) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Restore focus
      try {
        lastActiveElementRef.current && lastActiveElementRef.current.focus();
      } catch (err) {
        // ignore
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick(e) {
    // close only when clicking the backdrop itself
    if (e.target === e.currentTarget) {
      onClose && onClose();
    }
  }

  const modalContent = (
    <div style={backdropStyle} role="presentation" onMouseDown={handleBackdropClick}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        ref={modalRef}
        tabIndex={-1}
        style={{ ...containerBase, ...sizeStyles[size] }}
        className={className}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <button
            aria-label="Close modal"
            onClick={onClose}
            style={closeButtonStyle}
            type="button"
          >
            ×
          </button>
        </div>
        <div style={bodyStyle}>{children}</div>
      </div>
    </div>
  );

  // Render into portal root if available; fallback to body
  const portalRoot = document.getElementById("modal-root") || document.body;
  return ReactDOM.createPortal(modalContent, portalRoot);
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default Modal;