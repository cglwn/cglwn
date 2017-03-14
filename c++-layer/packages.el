(defconst c++-layer-packages
  '(
    cc-mode))

(defun c++-layer/init-cc-mode ()
  (use-package cc-mode
    :mode ("\\.h\\'" . c++-mode)))
