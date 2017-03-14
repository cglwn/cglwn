(defconst c++-layer-packages
  '(
    cc-mode
    modern-cpp-font-lock
    rtags))

(defun c++-layer/init-cc-mode ()
  (use-package cc-mode
    :mode ("\\.h\\'" . c++-mode)))

(defun c++-layer/init-modern-cpp-font-lock ()
  (add-hook 'c++-mode-hook #'modern-c++-font-lock-mode))

(defun c++-layer/init-rtags ()
  :defer t
  :config
  (progn
    (spacemacs/set-leader-keys-for-major-mode 'c++-mode
      "gg" 'rtags-find-symbol-at-point)))
