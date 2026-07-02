########## PAD of LTR5Hs over DEG (hESC vs hPGCLC) ##########

import argparse
import os
import pandas as pd
import scipy.stats as stats
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages

parser = argparse.ArgumentParser()
parser.add_argument('-s', '--species', type=str, choices=['hg38', 'hg37', 'mm9', 'mm10'], help='species of genome')
parser.add_argument('-u', '--up_genes', type=str, help='name of up-regulated genes file')
parser.add_argument('-d', '--down_genes', type=str, help='name of down-regulated genes file')
parser.add_argument('-p', '--peak_file', type=str, help='name of peak-covered genes file')
parser.add_argument('-dst', '--distance', type=int, choices=[1000,10_000,25_000,50_000, 100_000,500_000, 1_000_000], default=1_000_000,
                    help='maximum regulation distance to trace; defaults to 1000000')
parser.add_argument('-uid', '--uid', type=int, help='save file for different users')
parser.add_argument('-color', '--color', type=str, help='color of the figure', default = "1E3758EB8A7A")
parser.add_argument('-title', '--title', type=str, help='title of the result figure', default = "Peak Associated DEGs")

args = parser.parse_args()

GENOME_PATHS = {
    'hg38': './Reference/Homo_sapiens.GRCh38.97_pcg_chr.txt',
    'hg37': './Reference/Homo_sapiens.GRCh37.75_pcg_chr.txt',
    'mm9': './Reference/Mus_musculus.NCBIM37.67_pcg_chr.txt',
    'mm10': './Reference/Mus_musculus.NCBIM37.67_pcg_chr.txt',
    'TAIR10': './Reference/Arabidopsis_thaliana.TAIR10.47_pcg_chr.txt',
}
GENOME_SIZES = {
    'hg38': 19957,
    'hg37': 22810,
    'mm9': 26873,
    'mm10': 21823,
    'TAIR10':27185,
}
genome_path = GENOME_PATHS[args.species]
genome_size = GENOME_SIZES[args.species]

up = pd.read_csv(args.up_genes)
dw = pd.read_csv(args.down_genes)

color1 = args.color[0:6]
color2 = args.color[6:12]

title = args.title

########################### generate peak-covered genes ################################
txt_format = """awk '{{ print "chr"$1"\\t"(int(($2+$3)/2))"\\t"(int(($2+$3)/2)+1) }}' {0} \\
    | awk '{{ print $1"\\t"($2-{1})"\\t"($2+{1})"\\t"$3 }}' - \\
    | awk '{{ if ($2<0)print $1"\\t1\\t"$3"\\t"$4;else print $0 }}' - \\
    | bedtools intersect -a {2} -b - -wb > """.format(args.peak_file, args.distance, genome_path)
covered_gene_path = "./static/file/{}-{}.txt".format('PAD_genename_distance', args.uid)
txt_format += covered_gene_path
os.system(txt_format)
cov = pd.read_table(covered_gene_path, header=None)

# rebuild cov
cov_plus = cov.loc[cov.iloc[:, 5] == '+']
cov_minus = cov.loc[cov.iloc[:, 5] == '-']
cov_TSSdis = (cov_plus.iloc[:, 13] - cov_plus.iloc[:, 1]).append(cov_minus.iloc[:, 13] - cov_minus.iloc[:, 2])
cov = pd.DataFrame({
    'esmbl': cov_plus.iloc[:, 6].append(cov_minus.iloc[:, 6]),
    'genename': cov_plus.iloc[:, 3].append(cov_minus.iloc[:, 3]),
})

LOWER_BOUNDS = {
    1_000: [-1000,-500,-200,-100,-50,0,
            50,100,200,500],
    10_000: [-10_000,-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000],
    25_000: [-25_000,-10_000,-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000,10_000],
    50_000: [-50_000,-25_000,-10_000,-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000,10_000,25_000],
    100_000: [-100_000,-50_000,-25_000,-10_000,-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000,10_000,25_000,50_000],
    500_000: [-500_000, -200_000, -100_000, -50_000, -25_000, -10_000, -5_000, -2_000,-1_000,0,
            1_000,2_000,5_000, 10_000, 25_000,50_000, 100_000, 200_000],
    1_000_000: [-1000_000, -500_000, -200_000, -100_000, -50_000, -25_000, -10_000, -5_000,-2_000, -1_000, 0,
            1_000,2_000,5_000, 10_000, 25_000,50_000, 100_000, 200_000, 500_000],
}
UPPER_BOUNDS = {
    1_000: [-500,-200,-100,-50,0,
            50,100,200,500,1000],
    10_000: [-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000,10_000],
    25_000: [-10_000,-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000,10_000,25_000],
    50_000: [-25_000,-10_000,-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000,10_000,25_000,50_000],
    100_000: [-50_000,-25_000,-10_000,-5_000,-2_000,-1_000,-500,-100,0,
            100,500,1000,2_000,5_000,10_000,25_000,50_000,100_000],
    500_000: [-200_000, -100_000, -50_000, -25_000, -10_000, -5_000, -2_000,-1_000,0,
            1_000,2_000,5_000, 10_000, 25_000,50_000, 100_000, 200_000, 500_000],
    1_000_000: [-500_000, -200_000, -100_000, -50_000, -25_000, -10_000, -5_000,-2_000, -1_000, 0,
            1_000,2_000,5_000, 10_000, 25_000,50_000, 100_000, 200_000, 500_000, 1000_000],
}
lower_bounds = LOWER_BOUNDS[args.distance]
upper_bounds = UPPER_BOUNDS[args.distance]

total_counts, up_counts, dw_counts, up_genes, dw_genes, up_dists, dw_dists = [], [], [], [], [], [], []
uses_geneid = 'ENSEMBL' in up.columns and 'ENSEMBL' in dw.columns
if uses_geneid:
    up_tbl = frozenset(up['ENSEMBL'])
    dw_tbl = frozenset(dw['ENSEMBL'])
else:
    up_tbl = frozenset(up['SYMBOL'])
    dw_tbl = frozenset(dw['SYMBOL'])

assert (len(lower_bounds) == len(upper_bounds))
for low, high in zip(lower_bounds, upper_bounds):
    new_record = cov.loc[cov_TSSdis < high].loc[cov_TSSdis >= low].drop_duplicates()

    total_counts.append(len(new_record.index))
    if uses_geneid:
        is_up = new_record['esmbl'].apply(lambda x: x in up_tbl)
        is_dw = new_record['esmbl'].apply(lambda x: x in dw_tbl)
    else:
        is_up = new_record['genename'].apply(lambda x: x in up_tbl)
        is_dw = new_record['genename'].apply(lambda x: x in dw_tbl)

    up_counts.append(np.sum(is_up))
    dw_counts.append(np.sum(is_dw))
    up_genes.append(new_record.loc[is_up])
    dw_genes.append(new_record.loc[is_dw])
    if low >= 1000 or low <= -1000:
        dist = "{0}kb".format(int(low / 1000))
    else:
        dist = "{0}kb".format(low / 1000)
    up_dists.extend([dist, ] * up_counts[-1])
    dw_dists.extend([dist, ] * dw_counts[-1])

up_degs = pd.concat(up_genes).reset_index(drop=True)
up_degs['type'] = ['up', ] * len(up_dists)
up_degs['dist'] = up_dists
dw_degs = pd.concat(dw_genes).reset_index(drop=True)
dw_degs['type'] = ['dw', ] * len(dw_dists)
dw_degs['dist'] = dw_dists
degs = up_degs.append(dw_degs)

genenames_path = "./static/file/{}-{}.txt".format('PAD_genename_distance', args.uid)
degs.to_csv(genenames_path, sep='\t', index=False)

control = {
    'up': len(up.index),
    'dw': len(dw.index),
    'total': genome_size,
    'type': 'control',
    'dist': 'control',
}

counts = pd.DataFrame({
    'up': up_counts,
    'dw': dw_counts,
    'total': total_counts,
    'type': ['covered_genes'] * len(lower_bounds),  # FIXME: path name
    'dist': ["{0}kb".format(int(low / 1000)) if low >= 1000 or low <= -1000 else "{0}kb".format((low / 1000))for low in lower_bounds],
    'pvalue_up': [stats.hypergeom.sf(up_count, control['total'], control['up'], total_count)
                  for up_count, total_count in zip(up_counts, total_counts)],
    'pvalue_dw': [stats.hypergeom.sf(dw_count, control['total'], control['dw'], total_count)
                  for dw_count, total_count in zip(dw_counts, total_counts)],
})

pvalue_path = "./static/file/{}-{}.txt".format('PAD_genecount_pvalue', args.uid)
counts.to_csv(pvalue_path, sep='\t', index=False)

plot_up = (counts['up'] / counts['total']) / (control['up'] / control['total'])
plot_dw = (counts['dw'] / counts['total']) / (control['dw'] / control['total'])
plot_title = title

pdf = PdfPages("./static/file/{}-{}.pdf".format("Peak Associated DEGs", args.uid))
plt.rcParams['font.sans-serif'] = 'Arial'
plt.figure(plot_title,figsize=(8,5),dpi = 300)
plt.title(plot_title)
plt.xlabel('Distance to TSS')
plt.ylabel('Observed/Expected')
plt.grid(linestyle=':', axis='y')
plt.tick_params(labelsize=10)

x = np.arange(len(lower_bounds))
up_bar = plt.bar(x - 0.2, plot_up, 0.4, label='up', color="#" + color1, align='center')
dw_bar = plt.bar(x + 0.2, plot_dw, 0.4, label='dw', color="#" + color2, align='center')
plt.axhline(y=1, ls='--')
plt.xticks(x, ["{0}kb".format(int(low / 1000)) if low >= 1000 or low <= -1000 else "{0}kb".format((low / 1000))for low in lower_bounds], rotation=-90)
plt.legend()
plt.tight_layout()
# plt.show()

pdf.savefig()
plt.savefig("./static/file/{}-{}.png".format("Peak Associated DEGs", args.uid))
plt.savefig("./static/file/{}-{}.svg".format("Peak Associated DEGs", args.uid))
plt.close()
pdf.close()
