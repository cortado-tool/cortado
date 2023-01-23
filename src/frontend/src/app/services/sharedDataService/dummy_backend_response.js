export const startActivities = new Set(["place order", "send invoice"]);

export const endActivities = new Set([
  "confirm payment",
  "make delivery",
  "cancel order"
]);

export const activitiesInLog = {
  "place order": 2532,
  "send invoice": 2532,
  "pay": 2250,
  "prepare delivery": 2250,
  "make delivery": 2250,
  "confirm payment": 2250,
  "send reminder": 1872,
  "cancel order": 282
};


export const variant = [
  {
      "count": 483,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 132,
                          "max": 17967,
                          "mean": 2559.569358178054,
                          "median": 579,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 579,
                          "95th": 13845.099999999997,
                          "stdev": 4510.023251273316,
                          "percentage_variance": 176.2024239297672
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 6046,
                          "max": 1107524,
                          "mean": 382822.8944099379,
                          "median": 361228,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 361228,
                          "95th": 748808.3999999994,
                          "stdev": 218908.6942445881,
                          "percentage_variance": 57.18275929709008
                      },
                      "service_time": {
                          "min": 123,
                          "max": 15799,
                          "mean": 756.6770186335403,
                          "median": 375,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 375,
                          "95th": 1669.5,
                          "stdev": 1878.0087061688146,
                          "percentage_variance": 248.19158768165744
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 14839,
                          "max": 3338924,
                          "mean": 947606.7867494824,
                          "median": 850341,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 850341,
                          "95th": 2156000.899999996,
                          "stdev": 539500.6387723964,
                          "percentage_variance": 56.93296484536718
                      },
                      "service_time": {
                          "min": 123,
                          "max": 14203,
                          "mean": 728.4285714285714,
                          "median": 353,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 353,
                          "95th": 1537.499999999999,
                          "stdev": 1871.2004402868492,
                          "percentage_variance": 256.88180196132464
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 46693,
                          "max": 1569912,
                          "mean": 448404.39544513455,
                          "median": 431231,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 431231,
                          "95th": 859237.7999999999,
                          "stdev": 226760.83055793986,
                          "percentage_variance": 50.5706083306415
                      },
                      "service_time": {
                          "min": 168,
                          "max": 9600,
                          "mean": 1933.2277432712215,
                          "median": 439,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 439,
                          "95th": 9235.4,
                          "stdev": 3225.296373190123,
                          "percentage_variance": 166.8347862488559
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 22173,
                          "max": 408519,
                          "mean": 134525.29192546583,
                          "median": 88682,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 88682,
                          "95th": 318392.49999999994,
                          "stdev": 88514.38030793877,
                          "percentage_variance": 65.7975753414313
                      },
                      "service_time": {
                          "min": 542,
                          "max": 5996,
                          "mean": 2054.1469979296066,
                          "median": 1427,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 1427,
                          "95th": 5632.9,
                          "stdev": 1682.1559944161236,
                          "percentage_variance": 81.89073109721863
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 103,
                          "max": 390885,
                          "mean": 82584.1552795031,
                          "median": 66207,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 66207,
                          "95th": 262339.8,
                          "stdev": 87108.05626698812,
                          "percentage_variance": 105.47792851083119
                      },
                      "service_time": {
                          "min": 150,
                          "max": 16989,
                          "mean": 894.8633540372671,
                          "median": 449,
                          "n": 483,
                          "n_not_none": 483,
                          "50th": 449,
                          "95th": 1798.1999999999998,
                          "stdev": 2257.9208383841706,
                          "percentage_variance": 252.32018142181497
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1195080,
                  "max": 4229533,
                  "mean": 2004870.436853002,
                  "median": 1895309,
                  "n": 483,
                  "n_not_none": 483,
                  "50th": 1895309,
                  "95th": 3017733.599999998,
                  "stdev": 506995.7444056687,
                  "percentage_variance": 25.288204917694728
              }
          }
      },
      "length": 6,
      "number_of_activities": 6,
      "percentage": 38.15,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 483,
              "percentage": 100
          }
      ]
  },
  {
      "count": 230,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 130,
                          "max": 17125,
                          "mean": 2208.6478260869567,
                          "median": 544.5,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 544.5,
                          "95th": 13008.049999999985,
                          "stdev": 3922.362028140537,
                          "percentage_variance": 177.59110265622354
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 10929,
                          "max": 1255206,
                          "mean": 388702.3869565217,
                          "median": 383101,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 383101,
                          "95th": 813054.5999999996,
                          "stdev": 230387.40964459148,
                          "percentage_variance": 59.27090169126269
                      },
                      "service_time": {
                          "min": 122,
                          "max": 15920,
                          "mean": 1040.6478260869565,
                          "median": 408,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 408,
                          "95th": 5679.299999999889,
                          "stdev": 2567.2362762588405,
                          "percentage_variance": 246.69597263390835
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 375277,
                          "max": 1283271,
                          "mean": 708481.9434782609,
                          "median": 612289,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 612289,
                          "95th": 1201539.8499999999,
                          "stdev": 197962.96652712472,
                          "percentage_variance": 27.94185064974758
                      },
                      "service_time": {
                          "min": 387,
                          "max": 2697,
                          "mean": 1172.5086956521739,
                          "median": 1098.5,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 1098.5,
                          "95th": 2418.9999999999995,
                          "stdev": 578.569390155896,
                          "percentage_variance": 49.34457137088298
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 30669,
                          "max": 951232,
                          "mean": 305340.2304347826,
                          "median": 266269.5,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 266269.5,
                          "95th": 584381.2499999998,
                          "stdev": 160919.21557962947,
                          "percentage_variance": 52.701609398306935
                      },
                      "service_time": {
                          "min": 122,
                          "max": 13797,
                          "mean": 727.0347826086957,
                          "median": 357.5,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 357.5,
                          "95th": 1528.0999999999997,
                          "stdev": 1801.72781911033,
                          "percentage_variance": 247.81865492672793
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 78259,
                          "max": 999954,
                          "mean": 417386.48260869563,
                          "median": 428265.5,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 428265.5,
                          "95th": 763160.7,
                          "stdev": 195134.65939141967,
                          "percentage_variance": 46.751552223688215
                      },
                      "service_time": {
                          "min": 169,
                          "max": 9585,
                          "mean": 1705.682608695652,
                          "median": 437,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 437,
                          "95th": 9097.8,
                          "stdev": 3033.91816494347,
                          "percentage_variance": 177.87120238410176
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 27866,
                          "max": 400235,
                          "mean": 132349.00869565218,
                          "median": 86735,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 86735,
                          "95th": 321561.89999999997,
                          "stdev": 90247.78633610693,
                          "percentage_variance": 68.1892423868768
                      },
                      "service_time": {
                          "min": 549,
                          "max": 5925,
                          "mean": 2085.230434782609,
                          "median": 1387.5,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 1387.5,
                          "95th": 5463.499999999999,
                          "stdev": 1738.6280200441897,
                          "percentage_variance": 83.37822002993384
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 102,
                          "max": 330986,
                          "mean": 70944.93913043478,
                          "median": 62884,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 62884,
                          "95th": 256678.84999999995,
                          "stdev": 79578.84219900583,
                          "percentage_variance": 112.1698646505247
                      },
                      "service_time": {
                          "min": 150,
                          "max": 15507,
                          "mean": 645.7608695652174,
                          "median": 442,
                          "n": 230,
                          "n_not_none": 230,
                          "50th": 442,
                          "95th": 1564.2999999999975,
                          "stdev": 1294.4485022972822,
                          "percentage_variance": 200.45322708525495
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1246929,
                  "max": 3951467,
                  "mean": 2032790.5043478261,
                  "median": 1862219.5,
                  "n": 230,
                  "n_not_none": 230,
                  "50th": 1862219.5,
                  "95th": 3089398.9,
                  "stdev": 525580.7196371906,
                  "percentage_variance": 25.855134531229574
              }
          }
      },
      "length": 7,
      "number_of_activities": 7,
      "percentage": 18.17,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 230,
              "percentage": 100
          }
      ]
  },
  {
      "count": 141,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 126,
                          "max": 17307,
                          "mean": 2927.340425531915,
                          "median": 636,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 636,
                          "95th": 15398,
                          "stdev": 5036.418067904137,
                          "percentage_variance": 172.04757000508374
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 27435,
                          "max": 1107211,
                          "mean": 384868.8085106383,
                          "median": 333510,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 333510,
                          "95th": 918132,
                          "stdev": 235942.95625925332,
                          "percentage_variance": 61.30477478086706
                      },
                      "service_time": {
                          "min": 125,
                          "max": 8232,
                          "mean": 600.6524822695036,
                          "median": 388,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 388,
                          "95th": 1636,
                          "stdev": 963.7916786304838,
                          "percentage_variance": 160.45745369916665
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 548200,
                          "max": 1286443,
                          "mean": 752714.390070922,
                          "median": 619302,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 619302,
                          "95th": 1206769,
                          "stdev": 219835.54042055339,
                          "percentage_variance": 29.20570449036322
                      },
                      "service_time": {
                          "min": 387,
                          "max": 2641,
                          "mean": 1221.2624113475176,
                          "median": 1114,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 1114,
                          "95th": 2421,
                          "stdev": 576.6385057925938,
                          "percentage_variance": 47.21659329188245
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 545199,
                          "max": 1448911,
                          "mean": 729094.1134751773,
                          "median": 612812,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 612812,
                          "95th": 1203702,
                          "stdev": 208404.1374070408,
                          "percentage_variance": 28.583982994142787
                      },
                      "service_time": {
                          "min": 406,
                          "max": 2693,
                          "mean": 1234.5106382978724,
                          "median": 1103,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 1103,
                          "95th": 2385,
                          "stdev": 613.8524789861541,
                          "percentage_variance": 49.724357161678746
                      }
                  }
              },
              {
                  "leaf": [
                      "cancel order"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 3547,
                          "max": 583746,
                          "mean": 170027.02836879433,
                          "median": 150403,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 150403,
                          "95th": 417025,
                          "stdev": 132064.51090503045,
                          "percentage_variance": 77.67265720752238
                      },
                      "service_time": {
                          "min": 291,
                          "max": 27162,
                          "mean": 1100.9219858156027,
                          "median": 787,
                          "n": 141,
                          "n_not_none": 141,
                          "50th": 787,
                          "95th": 2156,
                          "stdev": 2301.8865153574793,
                          "percentage_variance": 209.0871601271691
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1302313,
                  "max": 3520078,
                  "mean": 2043789.0283687944,
                  "median": 1836697,
                  "n": 141,
                  "n_not_none": 141,
                  "50th": 1836697,
                  "95th": 3024568,
                  "stdev": 530408.5633064241,
                  "percentage_variance": 25.9522169824817
              }
          }
      },
      "length": 5,
      "number_of_activities": 5,
      "percentage": 11.14,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "cancel order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "cancel order",
                          "complete"
                      ]
                  ]
              ],
              "count": 141,
              "percentage": 100
          }
      ]
  },
  {
      "count": 132,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 139,
                          "max": 17635,
                          "mean": 2770.409090909091,
                          "median": 582.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 582.5,
                          "95th": 14128.99999999998,
                          "stdev": 4656.278861816664,
                          "percentage_variance": 168.07188790622752
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 71084,
                          "max": 1494889,
                          "mean": 393764.5909090909,
                          "median": 371388.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 371388.5,
                          "95th": 863978.4999999999,
                          "stdev": 242670.29684370736,
                          "percentage_variance": 61.628267865185734
                      },
                      "service_time": {
                          "min": 122,
                          "max": 14798,
                          "mean": 889.689393939394,
                          "median": 330.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 330.5,
                          "95th": 1662.9499999999973,
                          "stdev": 2426.350962740236,
                          "percentage_variance": 272.71888136114165
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 379411,
                          "max": 1219531,
                          "mean": 700458.3333333334,
                          "median": 610784,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 610784,
                          "95th": 1197394.9,
                          "stdev": 193723.64679641405,
                          "percentage_variance": 27.656698132853112
                      },
                      "service_time": {
                          "min": 387,
                          "max": 2680,
                          "mean": 1277.6060606060605,
                          "median": 1213,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 1213,
                          "95th": 2320.25,
                          "stdev": 558.4362129486718,
                          "percentage_variance": 43.7095776364559
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 380237,
                          "max": 1271596,
                          "mean": 666956.0378787878,
                          "median": 609798.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 609798.5,
                          "95th": 981930.4999999993,
                          "stdev": 145543.0676022561,
                          "percentage_variance": 21.82198815759233
                      },
                      "service_time": {
                          "min": 389,
                          "max": 2591,
                          "mean": 1183.1515151515152,
                          "median": 1071.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 1071.5,
                          "95th": 2443.4499999999994,
                          "stdev": 568.3546694653174,
                          "percentage_variance": 48.03735296679509
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 82523,
                          "max": 685506,
                          "mean": 297569.3106060606,
                          "median": 297402.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 297402.5,
                          "95th": 525395.2999999998,
                          "stdev": 151170.6169548363,
                          "percentage_variance": 50.80181711176684
                      },
                      "service_time": {
                          "min": 133,
                          "max": 12902,
                          "mean": 627.7727272727273,
                          "median": 342.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 342.5,
                          "95th": 1219.8999999999965,
                          "stdev": 1529.7837974814545,
                          "percentage_variance": 243.68433527327494
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 86846,
                          "max": 1206838,
                          "mean": 416000.50757575757,
                          "median": 424106.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 424106.5,
                          "95th": 703366.1499999999,
                          "stdev": 196687.7002588286,
                          "percentage_variance": 47.280639488885704
                      },
                      "service_time": {
                          "min": 169,
                          "max": 9556,
                          "mean": 2187.530303030303,
                          "median": 447,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 447,
                          "95th": 9029.449999999999,
                          "stdev": 3378.8002397512964,
                          "percentage_variance": 154.4572998632646
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 20473,
                          "max": 398675,
                          "mean": 124381.98484848485,
                          "median": 84344,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 84344,
                          "95th": 294520.1999999996,
                          "stdev": 87332.63982179883,
                          "percentage_variance": 70.21325469937028
                      },
                      "service_time": {
                          "min": 553,
                          "max": 5887,
                          "mean": 2070.7727272727275,
                          "median": 1413.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 1413.5,
                          "95th": 5454.399999999999,
                          "stdev": 1683.775345347967,
                          "percentage_variance": 81.31145070495263
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 35,
                          "max": 267522,
                          "mean": 72641.91666666667,
                          "median": 64273.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 64273.5,
                          "95th": 249154.19999999998,
                          "stdev": 72305.96278802272,
                          "percentage_variance": 99.53752062987881
                      },
                      "service_time": {
                          "min": 152,
                          "max": 17744,
                          "mean": 978.2727272727273,
                          "median": 440.5,
                          "n": 132,
                          "n_not_none": 132,
                          "50th": 440.5,
                          "95th": 1871.2499999999986,
                          "stdev": 2545.1704095407176,
                          "percentage_variance": 260.1698216239002
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1837662,
                  "max": 4088395,
                  "mean": 2683757.8863636362,
                  "median": 2495645,
                  "n": 132,
                  "n_not_none": 132,
                  "50th": 2495645,
                  "95th": 3856404.0999999987,
                  "stdev": 531077.766422058,
                  "percentage_variance": 19.788587082333382
              }
          }
      },
      "length": 8,
      "number_of_activities": 8,
      "percentage": 10.43,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 132,
              "percentage": 100
          }
      ]
  },
  {
      "count": 127,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 132,
                          "max": 17836,
                          "mean": 2350.244094488189,
                          "median": 550,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 550,
                          "95th": 14004.799999999988,
                          "stdev": 4347.390393511469,
                          "percentage_variance": 184.9761224251984
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 9569,
                          "max": 1098492,
                          "mean": 400599.031496063,
                          "median": 423871,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 423871,
                          "95th": 687465.9,
                          "stdev": 222259.19128240104,
                          "percentage_variance": 55.48170959184792
                      },
                      "service_time": {
                          "min": 124,
                          "max": 13235,
                          "mean": 842.0314960629921,
                          "median": 410,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 410,
                          "95th": 1427.9999999999964,
                          "stdev": 2091.193465490756,
                          "percentage_variance": 248.35097918169967
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 15400,
                          "max": 2838765,
                          "mean": 908979.9133858267,
                          "median": 763669,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 763669,
                          "95th": 1965313.999999996,
                          "stdev": 472141.2308531801,
                          "percentage_variance": 51.94187725166755
                      },
                      "service_time": {
                          "min": 121,
                          "max": 13638,
                          "mean": 729.3858267716536,
                          "median": 358,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 358,
                          "95th": 1567.5999999999992,
                          "stdev": 1857.096646147114,
                          "percentage_variance": 254.61101353817628
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 76658,
                          "max": 1309384,
                          "mean": 477131.7874015748,
                          "median": 493050,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 493050,
                          "95th": 1004405.5999999994,
                          "stdev": 253604.41498543601,
                          "percentage_variance": 53.151859021287876
                      },
                      "service_time": {
                          "min": 169,
                          "max": 9556,
                          "mean": 1204.007874015748,
                          "median": 424,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 424,
                          "95th": 8996.9,
                          "stdev": 2461.8896326662516,
                          "percentage_variance": 204.4745458727831
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 18862,
                          "max": 327414,
                          "mean": 120669.55905511811,
                          "median": 84153,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 84153,
                          "95th": 274912.6,
                          "stdev": 79770.07737297074,
                          "percentage_variance": 66.10621435728811
                      },
                      "service_time": {
                          "min": 155,
                          "max": 10171,
                          "mean": 560.6850393700787,
                          "median": 445,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 445,
                          "95th": 929.6999999999975,
                          "stdev": 908.5612794001277,
                          "percentage_variance": 162.0448586288093
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 40,
                          "max": 238744,
                          "mean": 21835.67716535433,
                          "median": 6719,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 6719,
                          "95th": 64234.09999999999,
                          "stdev": 39712.31112197978,
                          "percentage_variance": 181.86892406061713
                      },
                      "service_time": {
                          "min": 554,
                          "max": 5986,
                          "mean": 1909.5905511811025,
                          "median": 1476,
                          "n": 127,
                          "n_not_none": 127,
                          "50th": 1476,
                          "95th": 5374.599999999998,
                          "stdev": 1479.5046594621892,
                          "percentage_variance": 77.47758589123201
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1214683,
                  "max": 3733661,
                  "mean": 1936811.9133858269,
                  "median": 1826695,
                  "n": 127,
                  "n_not_none": 127,
                  "50th": 1826695,
                  "95th": 3000295.7999999993,
                  "stdev": 454900.0795747125,
                  "percentage_variance": 23.487055011938743
              }
          }
      },
      "length": 6,
      "number_of_activities": 6,
      "percentage": 10.03,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 127,
              "percentage": 100
          }
      ]
  },
  {
      "count": 53,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 134,
                          "max": 15967,
                          "mean": 2268.377358490566,
                          "median": 444,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 444,
                          "95th": 13151.799999999997,
                          "stdev": 4348.626057231335,
                          "percentage_variance": 191.70646545886075
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 31242,
                          "max": 1261579,
                          "mean": 374752.88679245283,
                          "median": 335315,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 335315,
                          "95th": 935150.1999999997,
                          "stdev": 276537.7476767698,
                          "percentage_variance": 73.79202600510536
                      },
                      "service_time": {
                          "min": 133,
                          "max": 14451,
                          "mean": 701.5094339622641,
                          "median": 384,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 384,
                          "95th": 1042.2,
                          "stdev": 1942.389385254087,
                          "percentage_variance": 276.8871366822663
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 554016,
                          "max": 1457789,
                          "mean": 716895.1509433963,
                          "median": 613103,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 613103,
                          "95th": 1124571.5999999999,
                          "stdev": 195914.01871655099,
                          "percentage_variance": 27.328127196667246
                      },
                      "service_time": {
                          "min": 411,
                          "max": 2693,
                          "mean": 1152.4150943396226,
                          "median": 1042,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 1042,
                          "95th": 2459.1999999999994,
                          "stdev": 618.6529235102502,
                          "percentage_variance": 53.68316733691879
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 85637,
                          "max": 676369,
                          "mean": 352023.6603773585,
                          "median": 354346,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 354346,
                          "95th": 582937,
                          "stdev": 152079.22890665897,
                          "percentage_variance": 43.20142252473448
                      },
                      "service_time": {
                          "min": 135,
                          "max": 10168,
                          "mean": 751.377358490566,
                          "median": 352,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 352,
                          "95th": 1752.5999999999997,
                          "stdev": 1800.542399330045,
                          "percentage_variance": 239.63224057577878
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 103592,
                          "max": 849012,
                          "mean": 415170.9811320755,
                          "median": 410031,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 410031,
                          "95th": 758648.4,
                          "stdev": 196042.01383195416,
                          "percentage_variance": 47.21958487979887
                      },
                      "service_time": {
                          "min": 176,
                          "max": 9525,
                          "mean": 991.7924528301887,
                          "median": 450,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 450,
                          "95th": 4402.59999999999,
                          "stdev": 2003.6125581106912,
                          "percentage_variance": 202.01933906566464
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 16743,
                          "max": 326500,
                          "mean": 125223.54716981133,
                          "median": 84132,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 84132,
                          "95th": 273165.6,
                          "stdev": 86039.02056548485,
                          "percentage_variance": 68.70834001276958
                      },
                      "service_time": {
                          "min": 178,
                          "max": 2085,
                          "mean": 526.5094339622641,
                          "median": 436,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 436,
                          "95th": 1137.9999999999998,
                          "stdev": 344.302786168127,
                          "percentage_variance": 65.39346951052045
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 87,
                          "max": 238127,
                          "mean": 35600.03773584906,
                          "median": 7990,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 7990,
                          "95th": 228310.19999999998,
                          "stdev": 65910.77541762344,
                          "percentage_variance": 185.14243132740174
                      },
                      "service_time": {
                          "min": 541,
                          "max": 5960,
                          "mean": 2075.8490566037735,
                          "median": 1521,
                          "n": 53,
                          "n_not_none": 53,
                          "50th": 1521,
                          "95th": 5765.2,
                          "stdev": 1740.1603418189593,
                          "percentage_variance": 83.8288475880793
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1318382,
                  "max": 3459417,
                  "mean": 2028134.0943396227,
                  "median": 1894354,
                  "n": 53,
                  "n_not_none": 53,
                  "50th": 1894354,
                  "95th": 3143323.5999999996,
                  "stdev": 504286.7401233176,
                  "percentage_variance": 24.864565983617446
              }
          }
      },
      "length": 7,
      "number_of_activities": 7,
      "percentage": 4.19,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 53,
              "percentage": 100
          }
      ]
  },
  {
      "count": 35,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 157,
                          "max": 17485,
                          "mean": 2597,
                          "median": 568,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 568,
                          "95th": 15542.899999999996,
                          "stdev": 4788.305803787832,
                          "percentage_variance": 184.37835209040554
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 15364,
                          "max": 947677,
                          "mean": 347881.14285714284,
                          "median": 295926,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 295926,
                          "95th": 758118.2999999995,
                          "stdev": 252659.2134188266,
                          "percentage_variance": 72.62802787864273
                      },
                      "service_time": {
                          "min": 147,
                          "max": 7217,
                          "mean": 660.8285714285714,
                          "median": 425,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 425,
                          "95th": 1277.799999999999,
                          "stdev": 1173.129261362765,
                          "percentage_variance": 177.52399216436842
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 590093,
                          "max": 1213242,
                          "mean": 732170.1428571428,
                          "median": 614132,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 614132,
                          "95th": 1108989.9999999998,
                          "stdev": 189014.8651826316,
                          "percentage_variance": 25.815702405596614
                      },
                      "service_time": {
                          "min": 430,
                          "max": 2695,
                          "mean": 1201.7142857142858,
                          "median": 1045,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 1045,
                          "95th": 2294.7,
                          "stdev": 573.6472359041785,
                          "percentage_variance": 47.73574240762303
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 543267,
                          "max": 1449333,
                          "mean": 785155.8857142857,
                          "median": 662019,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 662019,
                          "95th": 1215015.4,
                          "stdev": 247626.9811369241,
                          "percentage_variance": 31.538575414441244
                      },
                      "service_time": {
                          "min": 423,
                          "max": 2638,
                          "mean": 1225.6285714285714,
                          "median": 1105,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 1105,
                          "95th": 2439.2999999999993,
                          "stdev": 571.0359052126379,
                          "percentage_variance": 46.59126904548646
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 85938,
                          "max": 867948,
                          "mean": 347997.28571428574,
                          "median": 331329,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 331329,
                          "95th": 699676.1,
                          "stdev": 221593.49952208748,
                          "percentage_variance": 63.67678962416424
                      },
                      "service_time": {
                          "min": 138,
                          "max": 1757,
                          "mean": 407.77142857142854,
                          "median": 341,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 341,
                          "95th": 871.8999999999993,
                          "stdev": 306.9686787734201,
                          "percentage_variance": 75.27959471040992
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 83700,
                          "max": 1113896,
                          "mean": 481413.14285714284,
                          "median": 442856,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 442856,
                          "95th": 1060697.9999999998,
                          "stdev": 274251.37792255514,
                          "percentage_variance": 56.967987266591514
                      },
                      "service_time": {
                          "min": 176,
                          "max": 9597,
                          "mean": 1192.9142857142858,
                          "median": 385,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 385,
                          "95th": 9060.399999999998,
                          "stdev": 2551.455690286586,
                          "percentage_variance": 213.88424305429803
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 23804,
                          "max": 357954,
                          "mean": 125982.34285714285,
                          "median": 83579,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 83579,
                          "95th": 336981,
                          "stdev": 91824.32535520103,
                          "percentage_variance": 72.8866627439409
                      },
                      "service_time": {
                          "min": 153,
                          "max": 14184,
                          "mean": 1183.5714285714287,
                          "median": 477,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 477,
                          "95th": 3864.5999999999754,
                          "stdev": 2779.2464201408166,
                          "percentage_variance": 234.8186474470213
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 708,
                          "max": 234916,
                          "mean": 28270.742857142857,
                          "median": 8051,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 8051,
                          "95th": 61847.899999999994,
                          "stdev": 43383.65681393836,
                          "percentage_variance": 153.45778861618095
                      },
                      "service_time": {
                          "min": 554,
                          "max": 5933,
                          "mean": 2210.9142857142856,
                          "median": 1074,
                          "n": 35,
                          "n_not_none": 35,
                          "50th": 1074,
                          "95th": 5757.999999999999,
                          "stdev": 1866.8949743834416,
                          "percentage_variance": 84.43995257737001
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1786884,
                  "max": 4652025,
                  "mean": 2859551.0285714287,
                  "median": 2522965,
                  "n": 35,
                  "n_not_none": 35,
                  "50th": 2522965,
                  "95th": 4319466,
                  "stdev": 867770.6558479908,
                  "percentage_variance": 30.346395192028126
              }
          }
      },
      "length": 8,
      "number_of_activities": 8,
      "percentage": 2.76,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 35,
              "percentage": 100
          }
      ]
  },
  {
      "count": 27,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 180,
                          "max": 16969,
                          "mean": 2631.6296296296296,
                          "median": 545,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 545,
                          "95th": 12273.199999999999,
                          "stdev": 4617.839506057319,
                          "percentage_variance": 175.4745217208709
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 25948,
                          "max": 758441,
                          "mean": 365906.1111111111,
                          "median": 355154,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 355154,
                          "95th": 721041,
                          "stdev": 208316.88031667477,
                          "percentage_variance": 56.93178495546286
                      },
                      "service_time": {
                          "min": 175,
                          "max": 7393,
                          "mean": 701.3703703703703,
                          "median": 405,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 405,
                          "95th": 1696.599999999999,
                          "stdev": 1385.078035795155,
                          "percentage_variance": 197.4816864681269
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 374202,
                          "max": 1465547,
                          "mean": 924921.9629629629,
                          "median": 952042,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 952042,
                          "95th": 1439154.2,
                          "stdev": 312738.0814043895,
                          "percentage_variance": 33.81237487350191
                      },
                      "service_time": {
                          "min": 123,
                          "max": 11684,
                          "mean": 1294.148148148148,
                          "median": 407,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 407,
                          "95th": 8246.099999999993,
                          "stdev": 2931.5704862188654,
                          "percentage_variance": 226.52510768676484
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 109810,
                          "max": 1258289,
                          "mean": 501084.14814814815,
                          "median": 426419,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 426419,
                          "95th": 1145464.1999999997,
                          "stdev": 291405.2236890837,
                          "percentage_variance": 58.15494758036692
                      },
                      "service_time": {
                          "min": 174,
                          "max": 9295,
                          "mean": 2348.5925925925926,
                          "median": 472,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 472,
                          "95th": 8993.4,
                          "stdev": 3530.047986808931,
                          "percentage_variance": 150.3048250234043
                      }
                  }
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "confirm payment"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 160,
                                  "max": 16966,
                                  "mean": 2130.925925925926,
                                  "median": 406,
                                  "n": 27,
                                  "n_not_none": 27,
                                  "50th": 406,
                                  "95th": 15205.599999999997,
                                  "stdev": 4785.020544332762,
                                  "percentage_variance": 224.55123784997753
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 5016,
                                  "mean": 1245.5925925925926,
                                  "median": 748,
                                  "n": 27,
                                  "n_not_none": 27,
                                  "50th": 748,
                                  "95th": 3665.2,
                                  "stdev": 1429.8428977516069,
                                  "percentage_variance": 114.79218054560786
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 5074,
                                  "mean": 1630.7407407407406,
                                  "median": 1339,
                                  "n": 27,
                                  "n_not_none": 27,
                                  "50th": 1339,
                                  "95th": 4221.9,
                                  "stdev": 1502.1960998841405,
                                  "percentage_variance": 92.11740789659731
                              }
                          }
                      },
                      {
                          "leaf": [
                              "make delivery"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 700,
                                  "max": 5987,
                                  "mean": 3457.3333333333335,
                                  "median": 3557,
                                  "n": 27,
                                  "n_not_none": 27,
                                  "50th": 3557,
                                  "95th": 5894.5,
                                  "stdev": 1968.9798217507305,
                                  "percentage_variance": 56.95082399973188
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 7853,
                                  "mean": 474.51851851851853,
                                  "median": 0,
                                  "n": 27,
                                  "n_not_none": 27,
                                  "50th": 0,
                                  "95th": 1856.5999999999988,
                                  "stdev": 1550.6066150522752,
                                  "percentage_variance": 326.7747315517595
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 16239,
                                  "mean": 1075.4074074074074,
                                  "median": 0,
                                  "n": 27,
                                  "n_not_none": 27,
                                  "50th": 0,
                                  "95th": 8955.49999999999,
                                  "stdev": 3903.1018656690444,
                                  "percentage_variance": 362.9416943555042
                              }
                          }
                      }
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 69596,
                          "max": 330401,
                          "mean": 129900.29629629629,
                          "median": 86254,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 86254,
                          "95th": 273921.7,
                          "stdev": 80650.43665474564,
                          "percentage_variance": 62.086414699767815
                      },
                      "service_time": {
                          "min": 700,
                          "max": 18131,
                          "mean": 5007.259259259259,
                          "median": 4707,
                          "n": 27,
                          "n_not_none": 27,
                          "50th": 4707,
                          "95th": 15761.799999999997,
                          "stdev": 4441.399065718893,
                          "percentage_variance": 88.69920321193683
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1289978,
                  "max": 2931453,
                  "mean": 1933795.5185185184,
                  "median": 1840085,
                  "n": 27,
                  "n_not_none": 27,
                  "50th": 1840085,
                  "95th": 2745875.3,
                  "stdev": 371221.0361560855,
                  "percentage_variance": 19.196498936996097
              }
          }
      },
      "length": 5,
      "number_of_activities": 6,
      "percentage": 2.13,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 17,
              "percentage": 62.96
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 6,
              "percentage": 22.22
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 7.41
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ],
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 3.7
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 3.7
          }
      ]
  },
  {
      "count": 21,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 175,
                          "max": 12980,
                          "mean": 2801.904761904762,
                          "median": 433,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 433,
                          "95th": 12875,
                          "stdev": 4550.372807856098,
                          "percentage_variance": 162.40283644625774
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 61594,
                          "max": 1020303,
                          "mean": 405486.6666666667,
                          "median": 415418,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 415418,
                          "95th": 858953,
                          "stdev": 244947.04666689356,
                          "percentage_variance": 60.40816303048852
                      },
                      "service_time": {
                          "min": 181,
                          "max": 685,
                          "mean": 375.8095238095238,
                          "median": 375,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 375,
                          "95th": 586,
                          "stdev": 125.44027226039452,
                          "percentage_variance": 33.37868369828035
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 597111,
                          "max": 1222993,
                          "mean": 735683,
                          "median": 612480,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 612480,
                          "95th": 1190020,
                          "stdev": 217244.2198130942,
                          "percentage_variance": 29.529596281699348
                      },
                      "service_time": {
                          "min": 490,
                          "max": 2632,
                          "mean": 1300.2857142857142,
                          "median": 1166,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 1166,
                          "95th": 2401,
                          "stdev": 627.411917551551,
                          "percentage_variance": 48.25185039398877
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 93118,
                          "max": 584187,
                          "mean": 312486.1904761905,
                          "median": 324853,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 324853,
                          "95th": 503282,
                          "stdev": 161759.13949283332,
                          "percentage_variance": 51.76521216708243
                      },
                      "service_time": {
                          "min": 145,
                          "max": 766,
                          "mean": 348.14285714285717,
                          "median": 280,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 280,
                          "95th": 561,
                          "stdev": 162.78030768931657,
                          "percentage_variance": 46.75675641465802
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 83681,
                          "max": 962358,
                          "mean": 450514.61904761905,
                          "median": 497816,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 497816,
                          "95th": 691566,
                          "stdev": 201919.17132121857,
                          "percentage_variance": 44.819671279052514
                      },
                      "service_time": {
                          "min": 184,
                          "max": 8720,
                          "mean": 855.7142857142857,
                          "median": 421,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 421,
                          "95th": 1547,
                          "stdev": 1835.6198174692151,
                          "percentage_variance": 214.51316731693666
                      }
                  }
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "confirm payment"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 240,
                                  "max": 2008,
                                  "mean": 660.1428571428571,
                                  "median": 459,
                                  "n": 21,
                                  "n_not_none": 21,
                                  "50th": 459,
                                  "95th": 1509,
                                  "stdev": 454.2335616964345,
                                  "percentage_variance": 68.80837333639995
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 4975,
                                  "mean": 1164.4285714285713,
                                  "median": 608,
                                  "n": 21,
                                  "n_not_none": 21,
                                  "50th": 608,
                                  "95th": 4209,
                                  "stdev": 1469.037527479423,
                                  "percentage_variance": 126.15952266416343
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 5431,
                                  "mean": 1916.4285714285713,
                                  "median": 1173,
                                  "n": 21,
                                  "n_not_none": 21,
                                  "50th": 1173,
                                  "95th": 5298,
                                  "stdev": 1853.1477429343988,
                                  "percentage_variance": 96.69798136817587
                              }
                          }
                      },
                      {
                          "leaf": [
                              "make delivery"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 616,
                                  "max": 5968,
                                  "mean": 3557.0476190476193,
                                  "median": 4641,
                                  "n": 21,
                                  "n_not_none": 21,
                                  "50th": 4641,
                                  "95th": 5930,
                                  "stdev": 2068.383921717399,
                                  "percentage_variance": 58.14889602943235
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 1973,
                                  "mean": 138.14285714285714,
                                  "median": 0,
                                  "n": 21,
                                  "n_not_none": 21,
                                  "50th": 0,
                                  "95th": 421,
                                  "stdev": 438.0841569509546,
                                  "percentage_variance": 317.1240019293363
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 801,
                                  "mean": 45.80952380952381,
                                  "median": 0,
                                  "n": 21,
                                  "n_not_none": 21,
                                  "50th": 0,
                                  "95th": 161,
                                  "stdev": 176.55781462388433,
                                  "percentage_variance": 385.41726685047513
                              }
                          }
                      }
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 64589,
                          "max": 354270,
                          "mean": 130053.42857142857,
                          "median": 88482,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 88482,
                          "95th": 329152,
                          "stdev": 89312.67184872,
                          "percentage_variance": 68.67383107833045
                      },
                      "service_time": {
                          "min": 945,
                          "max": 6079,
                          "mean": 3741,
                          "median": 4641,
                          "n": 21,
                          "n_not_none": 21,
                          "50th": 4641,
                          "95th": 5930,
                          "stdev": 1929.3091509657024,
                          "percentage_variance": 51.57201686623102
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1189817,
                  "max": 3028386,
                  "mean": 2043646.761904762,
                  "median": 1888818,
                  "n": 21,
                  "n_not_none": 21,
                  "50th": 1888818,
                  "95th": 3024460,
                  "stdev": 538166.6753506672,
                  "percentage_variance": 26.333644609358714
              }
          }
      },
      "length": 6,
      "number_of_activities": 7,
      "percentage": 1.66,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 15,
              "percentage": 71.43
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 19.05
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 9.52
          }
      ]
  },
  {
      "count": 8,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 153,
                          "max": 1009,
                          "mean": 528.25,
                          "median": 521,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 521,
                          "95th": 953.6999999999999,
                          "stdev": 340.07593689813285,
                          "percentage_variance": 64.37783945066406
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 66568,
                          "max": 891646,
                          "mean": 403112.625,
                          "median": 339428.5,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 339428.5,
                          "95th": 824243.7,
                          "stdev": 288432.99691953097,
                          "percentage_variance": 71.55146701732077
                      },
                      "service_time": {
                          "min": 120,
                          "max": 10282,
                          "mean": 1578.5,
                          "median": 367,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 367,
                          "95th": 6867.049999999995,
                          "stdev": 3518.652745420773,
                          "percentage_variance": 222.9111653735048
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 587547,
                          "max": 1277220,
                          "mean": 769734.25,
                          "median": 612001.5,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 612001.5,
                          "95th": 1252718.5999999999,
                          "stdev": 293033.589146242,
                          "percentage_variance": 38.0694491827851
                      },
                      "service_time": {
                          "min": 494,
                          "max": 1839,
                          "mean": 1073.5,
                          "median": 904,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 904,
                          "95th": 1746.2499999999998,
                          "stdev": 480.45752004878494,
                          "percentage_variance": 44.75617326956544
                      }
                  }
              },
              {
                  "leaf": [
                      "send reminder"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 549555,
                          "max": 1053050,
                          "mean": 701395.125,
                          "median": 645778,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 645778,
                          "95th": 976939.6999999998,
                          "stdev": 164842.71126695073,
                          "percentage_variance": 23.5021181915045
                      },
                      "service_time": {
                          "min": 741,
                          "max": 2193,
                          "mean": 1477.375,
                          "median": 1404,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 1404,
                          "95th": 2159.75,
                          "stdev": 472.5526236757734,
                          "percentage_variance": 31.98596318983152
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 109706,
                          "max": 491910,
                          "mean": 302402.375,
                          "median": 320878.5,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 320878.5,
                          "95th": 462824.29999999993,
                          "stdev": 134845.83230906693,
                          "percentage_variance": 44.591525549052626
                      },
                      "service_time": {
                          "min": 240,
                          "max": 879,
                          "mean": 464.5,
                          "median": 325.5,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 325.5,
                          "95th": 876.2,
                          "stdev": 264.35419962077935,
                          "percentage_variance": 56.91156073644335
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 236191,
                          "max": 626432,
                          "mean": 461208.5,
                          "median": 436063.5,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 436063.5,
                          "95th": 619289.2,
                          "stdev": 121193.1154303506,
                          "percentage_variance": 26.277294418977664
                      },
                      "service_time": {
                          "min": 221,
                          "max": 8410,
                          "mean": 1761.625,
                          "median": 708.5,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 708.5,
                          "95th": 6041.199999999996,
                          "stdev": 2739.1484045489133,
                          "percentage_variance": 155.48986898737888
                      }
                  }
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "confirm payment"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 219,
                                  "max": 15959,
                                  "mean": 2802.375,
                                  "median": 509,
                                  "n": 8,
                                  "n_not_none": 8,
                                  "50th": 509,
                                  "95th": 11168.199999999993,
                                  "stdev": 5374.358936854037,
                                  "percentage_variance": 191.77872115095366
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 3394,
                                  "mean": 1227.875,
                                  "median": 989,
                                  "n": 8,
                                  "n_not_none": 8,
                                  "50th": 989,
                                  "95th": 3152.1499999999996,
                                  "stdev": 1238.0153977233078,
                                  "percentage_variance": 100.82584935138412
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 680,
                                  "mean": 174.625,
                                  "median": 0,
                                  "n": 8,
                                  "n_not_none": 8,
                                  "50th": 0,
                                  "95th": 641.5,
                                  "stdev": 284.0920059719084,
                                  "percentage_variance": 162.68690392092105
                              }
                          }
                      },
                      {
                          "leaf": [
                              "make delivery"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 641,
                                  "max": 5654,
                                  "mean": 1990.625,
                                  "median": 1429,
                                  "n": 8,
                                  "n_not_none": 8,
                                  "50th": 1429,
                                  "95th": 4871.749999999999,
                                  "stdev": 1706.3262070893713,
                                  "percentage_variance": 85.71811401390876
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 10824,
                                  "mean": 1353,
                                  "median": 0,
                                  "n": 8,
                                  "n_not_none": 8,
                                  "50th": 0,
                                  "95th": 7035.599999999995,
                                  "stdev": 3826.861899781595,
                                  "percentage_variance": 282.842712474619
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 4254,
                                  "mean": 861.25,
                                  "median": 166.5,
                                  "n": 8,
                                  "n_not_none": 8,
                                  "50th": 166.5,
                                  "95th": 3415.049999999999,
                                  "stdev": 1505.552841033106,
                                  "percentage_variance": 174.81019924912698
                              }
                          }
                      }
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 70729,
                          "max": 257712,
                          "mean": 105597.875,
                          "median": 86297,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 86297,
                          "95th": 198872.09999999992,
                          "stdev": 61742.69636954757,
                          "percentage_variance": 58.46963906191064
                      },
                      "service_time": {
                          "min": 641,
                          "max": 15959,
                          "mean": 4204.875,
                          "median": 2370.5,
                          "n": 8,
                          "n_not_none": 8,
                          "50th": 2370.5,
                          "95th": 12352.249999999995,
                          "stdev": 5000.2303786211405,
                          "percentage_variance": 118.915077823268
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1960360,
                  "max": 4069966,
                  "mean": 2754539.375,
                  "median": 2410590.5,
                  "n": 8,
                  "n_not_none": 8,
                  "50th": 2410590.5,
                  "95th": 3952224.25,
                  "stdev": 758369.4798884431,
                  "percentage_variance": 27.53162604141185
              }
          }
      },
      "length": 7,
      "number_of_activities": 8,
      "percentage": 0.63,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 50
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 3,
              "percentage": 37.5
          },
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send reminder",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 12.5
          }
      ]
  },
  {
      "count": 5,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 323,
                          "max": 2113,
                          "mean": 738.8,
                          "median": 421,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 421,
                          "95th": 1787.7999999999997,
                          "stdev": 770.8567960393162,
                          "percentage_variance": 104.33903573894374
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 810694,
                          "max": 1026266,
                          "mean": 878220.8,
                          "median": 853630,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 853630,
                          "95th": 994930.7999999999,
                          "stdev": 85722.56908889281,
                          "percentage_variance": 9.76093587044315
                      },
                      "service_time": {
                          "min": 219,
                          "max": 472,
                          "mean": 318.4,
                          "median": 322,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 322,
                          "95th": 447.2,
                          "stdev": 102.47097149924949,
                          "percentage_variance": 32.18309406383464
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 28918,
                          "max": 503004,
                          "mean": 198199.6,
                          "median": 68301,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 68301,
                          "95th": 471733.39999999997,
                          "stdev": 214600.05668522086,
                          "percentage_variance": 108.27471734817873
                      },
                      "service_time": {
                          "min": 248,
                          "max": 557,
                          "mean": 352,
                          "median": 303,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 303,
                          "95th": 520.4,
                          "stdev": 123.69518988222622,
                          "percentage_variance": 35.140678943814265
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 75171,
                          "max": 1041036,
                          "mean": 479001.2,
                          "median": 489498,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 489498,
                          "95th": 971755,
                          "stdev": 410267.8428766993,
                          "percentage_variance": 85.6506920810844
                      },
                      "service_time": {
                          "min": 171,
                          "max": 8990,
                          "mean": 2119,
                          "median": 473,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 473,
                          "95th": 7301.999999999998,
                          "stdev": 3843.6208840102845,
                          "percentage_variance": 181.3884324686307
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 76875,
                          "max": 274864,
                          "mean": 158411.2,
                          "median": 108744,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 108744,
                          "95th": 270498,
                          "stdev": 97479.84395094197,
                          "percentage_variance": 61.53595449749889
                      },
                      "service_time": {
                          "min": 630,
                          "max": 3190,
                          "mean": 1473.6,
                          "median": 920,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 920,
                          "95th": 2907.2,
                          "stdev": 1053.8020687017083,
                          "percentage_variance": 71.51208392384014
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 3917,
                          "max": 226686,
                          "mean": 84866.4,
                          "median": 78675,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 78675,
                          "95th": 199500.39999999997,
                          "stdev": 87188.62030850127,
                          "percentage_variance": 102.73632475102193
                      },
                      "service_time": {
                          "min": 238,
                          "max": 641,
                          "mean": 466.4,
                          "median": 422,
                          "n": 5,
                          "n_not_none": 5,
                          "50th": 422,
                          "95th": 634.8,
                          "stdev": 163.78736214983132,
                          "percentage_variance": 35.117358951507576
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1396638,
                  "max": 2139718,
                  "mean": 1804167.4,
                  "median": 1964114,
                  "n": 5,
                  "n_not_none": 5,
                  "50th": 1964114,
                  "95th": 2112079.8,
                  "stdev": 325814.3139808317,
                  "percentage_variance": 18.058984658565038
              }
          }
      },
      "length": 6,
      "number_of_activities": 6,
      "percentage": 0.39,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 5,
              "percentage": 100
          }
      ]
  },
  {
      "count": 2,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 307,
                          "max": 800,
                          "mean": 553.5,
                          "median": 553.5,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 553.5,
                          "95th": 775.35,
                          "stdev": 348.6036431249679,
                          "percentage_variance": 62.98168800812428
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 1118823,
                          "max": 1229690,
                          "mean": 1174256.5,
                          "median": 1174256.5,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 1174256.5,
                          "95th": 1224146.65,
                          "stdev": 78394.80750980896,
                          "percentage_variance": 6.6761229347939715
                      },
                      "service_time": {
                          "min": 399,
                          "max": 13789,
                          "mean": 7094,
                          "median": 7094,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 7094,
                          "95th": 13119.5,
                          "stdev": 9468.159800087871,
                          "percentage_variance": 133.46715252449778
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 42578,
                          "max": 73247,
                          "mean": 57912.5,
                          "median": 57912.5,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 57912.5,
                          "95th": 71713.55,
                          "stdev": 21686.257872210226,
                          "percentage_variance": 37.44659248385103
                      },
                      "service_time": {
                          "min": 346,
                          "max": 492,
                          "mean": 419,
                          "median": 419,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 419,
                          "95th": 484.7,
                          "stdev": 103.23759005323593,
                          "percentage_variance": 24.63904297213268
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 174840,
                          "max": 591286,
                          "mean": 383063,
                          "median": 383063,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 383063,
                          "95th": 570463.7,
                          "stdev": 294471.790598013,
                          "percentage_variance": 76.8729401163811
                      },
                      "service_time": {
                          "min": 231,
                          "max": 9459,
                          "mean": 4845,
                          "median": 4845,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 4845,
                          "95th": 8997.6,
                          "stdev": 6525.181376789461,
                          "percentage_variance": 134.678666187605
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 75371,
                          "max": 268623,
                          "mean": 171997,
                          "median": 171997,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 171997,
                          "95th": 258960.4,
                          "stdev": 136649.79967786267,
                          "percentage_variance": 79.44894368963567
                      },
                      "service_time": {
                          "min": 444,
                          "max": 994,
                          "mean": 719,
                          "median": 719,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 719,
                          "95th": 966.5,
                          "stdev": 388.90872965260115,
                          "percentage_variance": 54.090226655438265
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 7735,
                          "max": 59426,
                          "mean": 33580.5,
                          "median": 33580.5,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 33580.5,
                          "95th": 56841.45,
                          "stdev": 36551.05662631383,
                          "percentage_variance": 108.84607622374244
                      },
                      "service_time": {
                          "min": 546,
                          "max": 1948,
                          "mean": 1247,
                          "median": 1247,
                          "n": 2,
                          "n_not_none": 2,
                          "50th": 1247,
                          "95th": 1877.8999999999999,
                          "stdev": 991.3637072235397,
                          "percentage_variance": 79.49989632907295
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1690370,
                  "max": 1981004,
                  "mean": 1835687,
                  "median": 1835687,
                  "n": 2,
                  "n_not_none": 2,
                  "50th": 1835687,
                  "95th": 1966472.3,
                  "stdev": 205509.27224337106,
                  "percentage_variance": 11.19522403565374
              }
          }
      },
      "length": 6,
      "number_of_activities": 6,
      "percentage": 0.16,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 100
          }
      ]
  },
  {
      "count": 1,
      "variant": {
          "follows": [
              {
                  "parallel": [
                      {
                          "leaf": [
                              "place order"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 13259,
                                  "max": 13259,
                                  "mean": 13259,
                                  "median": 13259,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 13259,
                                  "95th": 13259
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 0,
                                  "mean": 0,
                                  "median": 0,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 0,
                                  "95th": 0
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 0,
                                  "mean": 0,
                                  "median": 0,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 0,
                                  "95th": 0
                              }
                          }
                      },
                      {
                          "leaf": [
                              "send invoice"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 240,
                                  "max": 240,
                                  "mean": 240,
                                  "median": 240,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 240,
                                  "95th": 240
                              },
                              "wait_time_start": {
                                  "min": 4611,
                                  "max": 4611,
                                  "mean": 4611,
                                  "median": 4611,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 4611,
                                  "95th": 4611
                              },
                              "wait_time_end": {
                                  "min": 8408,
                                  "max": 8408,
                                  "mean": 8408,
                                  "median": 8408,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 8408,
                                  "95th": 8408
                              }
                          }
                      }
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 13259,
                          "max": 13259,
                          "mean": 13259,
                          "median": 13259,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 13259,
                          "95th": 13259
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 1191549,
                          "max": 1191549,
                          "mean": 1191549,
                          "median": 1191549,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 1191549,
                          "95th": 1191549
                      },
                      "service_time": {
                          "min": 273,
                          "max": 273,
                          "mean": 273,
                          "median": 273,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 273,
                          "95th": 273
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 188982,
                          "max": 188982,
                          "mean": 188982,
                          "median": 188982,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 188982,
                          "95th": 188982
                      },
                      "service_time": {
                          "min": 213,
                          "max": 213,
                          "mean": 213,
                          "median": 213,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 213,
                          "95th": 213
                      }
                  }
              },
              {
                  "leaf": [
                      "make delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 266112,
                          "max": 266112,
                          "mean": 266112,
                          "median": 266112,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 266112,
                          "95th": 266112
                      },
                      "service_time": {
                          "min": 644,
                          "max": 644,
                          "mean": 644,
                          "median": 644,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 644,
                          "95th": 644
                      }
                  }
              },
              {
                  "leaf": [
                      "confirm payment"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 65412,
                          "max": 65412,
                          "mean": 65412,
                          "median": 65412,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 65412,
                          "95th": 65412
                      },
                      "service_time": {
                          "min": 263,
                          "max": 263,
                          "mean": 263,
                          "median": 263,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 263,
                          "95th": 263
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1726707,
                  "max": 1726707,
                  "mean": 1726707,
                  "median": 1726707,
                  "n": 1,
                  "n_not_none": 1,
                  "50th": 1726707,
                  "95th": 1726707
              }
          }
      },
      "length": 5,
      "number_of_activities": 6,
      "percentage": 0.08,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 100
          }
      ]
  },
  {
      "count": 1,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "place order"
                  ],
                  "performance": {
                      "wait_time": null,
                      "service_time": {
                          "min": 8171,
                          "max": 8171,
                          "mean": 8171,
                          "median": 8171,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 8171,
                          "95th": 8171
                      }
                  }
              },
              {
                  "leaf": [
                      "pay"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 1129219,
                          "max": 1129219,
                          "mean": 1129219,
                          "median": 1129219,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 1129219,
                          "95th": 1129219
                      },
                      "service_time": {
                          "min": 324,
                          "max": 324,
                          "mean": 324,
                          "median": 324,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 324,
                          "95th": 324
                      }
                  }
              },
              {
                  "leaf": [
                      "send invoice"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 82728,
                          "max": 82728,
                          "mean": 82728,
                          "median": 82728,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 82728,
                          "95th": 82728
                      },
                      "service_time": {
                          "min": 201,
                          "max": 201,
                          "mean": 201,
                          "median": 201,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 201,
                          "95th": 201
                      }
                  }
              },
              {
                  "leaf": [
                      "prepare delivery"
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 164095,
                          "max": 164095,
                          "mean": 164095,
                          "median": 164095,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 164095,
                          "95th": 164095
                      },
                      "service_time": {
                          "min": 231,
                          "max": 231,
                          "mean": 231,
                          "median": 231,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 231,
                          "95th": 231
                      }
                  }
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "confirm payment"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 426,
                                  "max": 426,
                                  "mean": 426,
                                  "median": 426,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 426,
                                  "95th": 426
                              },
                              "wait_time_start": {
                                  "min": 4206,
                                  "max": 4206,
                                  "mean": 4206,
                                  "median": 4206,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 4206,
                                  "95th": 4206
                              },
                              "wait_time_end": {
                                  "min": 997,
                                  "max": 997,
                                  "mean": 997,
                                  "median": 997,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 997,
                                  "95th": 997
                              }
                          }
                      },
                      {
                          "leaf": [
                              "make delivery"
                          ],
                          "performance": {
                              "wait_time": null,
                              "service_time": {
                                  "min": 5629,
                                  "max": 5629,
                                  "mean": 5629,
                                  "median": 5629,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 5629,
                                  "95th": 5629
                              },
                              "wait_time_start": {
                                  "min": 0,
                                  "max": 0,
                                  "mean": 0,
                                  "median": 0,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 0,
                                  "95th": 0
                              },
                              "wait_time_end": {
                                  "min": 0,
                                  "max": 0,
                                  "mean": 0,
                                  "median": 0,
                                  "n": 1,
                                  "n_not_none": 1,
                                  "50th": 0,
                                  "95th": 0
                              }
                          }
                      }
                  ],
                  "performance": {
                      "wait_time": {
                          "min": 95809,
                          "max": 95809,
                          "mean": 95809,
                          "median": 95809,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 95809,
                          "95th": 95809
                      },
                      "service_time": {
                          "min": 5629,
                          "max": 5629,
                          "mean": 5629,
                          "median": 5629,
                          "n": 1,
                          "n_not_none": 1,
                          "50th": 5629,
                          "95th": 5629
                      }
                  }
              }
          ],
          "performance": {
              "wait_time": null,
              "service_time": {
                  "min": 1486407,
                  "max": 1486407,
                  "mean": 1486407,
                  "median": 1486407,
                  "n": 1,
                  "n_not_none": 1,
                  "50th": 1486407,
                  "95th": 1486407
              }
          }
      },
      "length": 5,
      "number_of_activities": 6,
      "percentage": 0.08,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "place order",
                          "start"
                      ]
                  ],
                  [
                      [
                          "place order",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "start"
                      ]
                  ],
                  [
                      [
                          "pay",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "start"
                      ]
                  ],
                  [
                      [
                          "send invoice",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "prepare delivery",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "start"
                      ]
                  ],
                  [
                      [
                          "confirm payment",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "make delivery",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 100
          }
      ]
  }
]
