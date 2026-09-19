# Build the Phase 2 results chapter.
# Requires: pdflatex, biber, KOMA-Script, booktabs, tikz, biblatex.
#
#   make
#   make clean

LATEX = pdflatex -interaction=nonstopmode -halt-on-error
BIBER = biber
MAIN = main

.PHONY: all clean

all: $(MAIN).pdf

$(MAIN).pdf: $(MAIN).tex references.bib \
	sections/01_intro.tex \
	sections/02_methods.tex \
	sections/03_instruments.tex \
	sections/04_topology.tex \
	sections/05_h_vs_he.tex \
	sections/06_four_designs.tex \
	sections/07_pooled.tex \
	sections/08_dnet_pfeffer.tex \
	sections/09_limitations.tex \
	sections/10_conclusion.tex
	$(LATEX) $(MAIN)
	$(BIBER) $(MAIN)
	$(LATEX) $(MAIN)
	$(LATEX) $(MAIN)

clean:
	rm -f $(MAIN).aux $(MAIN).bbl $(MAIN).bcf $(MAIN).blg $(MAIN).log \
	      $(MAIN).out $(MAIN).toc $(MAIN).run.xml $(MAIN).lof $(MAIN).lot \
	      $(MAIN).pdf
