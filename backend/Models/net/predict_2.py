from pytorch_tabnet.tab_model import TabNetClassifier
import torch
""""""""""""""""""""""""""
class Model_2:
    def __init__(self, input_dim=17, output_dim=1):
        self.model = TabNetClassifier(
            input_dim=input_dim,
            output_dim=output_dim,
            n_d=8, n_a=8,
            n_steps=3,
            gamma=1.3,
            lambda_sparse=1e-3,
            optimizer_fn=torch.optim.AdamW,
            optimizer_params=dict(lr=0.0001),
            mask_type="sparsemax"
        )