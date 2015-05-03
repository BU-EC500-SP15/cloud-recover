namespace Reclo_Recovery_Manager
{
    partial class loginForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(loginForm));
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.loginBTN = new System.Windows.Forms.Button();
            this.logErrorLB = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.EmailLB = new System.Windows.Forms.Label();
            this.passTB = new System.Windows.Forms.TextBox();
            this.emailTB = new System.Windows.Forms.TextBox();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // pictureBox1
            // 
            this.pictureBox1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(40)))), ((int)(((byte)(125)))), ((int)(((byte)(255)))));
            this.pictureBox1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.pictureBox1.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox1.Image")));
            this.pictureBox1.Location = new System.Drawing.Point(-3, -1);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(341, 190);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.pictureBox1.TabIndex = 5;
            this.pictureBox1.TabStop = false;
            // 
            // loginBTN
            // 
            this.loginBTN.BackColor = System.Drawing.Color.DimGray;
            this.loginBTN.FlatAppearance.BorderSize = 0;
            this.loginBTN.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.loginBTN.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.loginBTN.ForeColor = System.Drawing.Color.White;
            this.loginBTN.Location = new System.Drawing.Point(12, 412);
            this.loginBTN.Name = "loginBTN";
            this.loginBTN.Size = new System.Drawing.Size(312, 53);
            this.loginBTN.TabIndex = 6;
            this.loginBTN.Text = "Login";
            this.loginBTN.UseVisualStyleBackColor = false;
            this.loginBTN.Click += new System.EventHandler(this.loginBTN_Click);
            // 
            // logErrorLB
            // 
            this.logErrorLB.AutoSize = true;
            this.logErrorLB.Font = new System.Drawing.Font("Microsoft Sans Serif", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.logErrorLB.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(192)))), ((int)(((byte)(0)))), ((int)(((byte)(0)))));
            this.logErrorLB.ImageAlign = System.Drawing.ContentAlignment.TopCenter;
            this.logErrorLB.Location = new System.Drawing.Point(12, 302);
            this.logErrorLB.Name = "logErrorLB";
            this.logErrorLB.Size = new System.Drawing.Size(81, 18);
            this.logErrorLB.TabIndex = 19;
            this.logErrorLB.Text = "Error Label";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label2.Location = new System.Drawing.Point(9, 257);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(77, 17);
            this.label2.TabIndex = 18;
            this.label2.Text = "Password";
            // 
            // EmailLB
            // 
            this.EmailLB.AutoSize = true;
            this.EmailLB.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.EmailLB.Location = new System.Drawing.Point(9, 212);
            this.EmailLB.Name = "EmailLB";
            this.EmailLB.Size = new System.Drawing.Size(47, 17);
            this.EmailLB.TabIndex = 17;
            this.EmailLB.Text = "Email";
            // 
            // passTB
            // 
            this.passTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.passTB.Location = new System.Drawing.Point(12, 277);
            this.passTB.Name = "passTB";
            this.passTB.PasswordChar = '*';
            this.passTB.Size = new System.Drawing.Size(312, 22);
            this.passTB.TabIndex = 16;
            this.passTB.UseSystemPasswordChar = true;
            // 
            // emailTB
            // 
            this.emailTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.emailTB.Location = new System.Drawing.Point(12, 232);
            this.emailTB.Name = "emailTB";
            this.emailTB.Size = new System.Drawing.Size(312, 22);
            this.emailTB.TabIndex = 15;
            // 
            // loginForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(336, 477);
            this.Controls.Add(this.logErrorLB);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.EmailLB);
            this.Controls.Add(this.passTB);
            this.Controls.Add(this.emailTB);
            this.Controls.Add(this.loginBTN);
            this.Controls.Add(this.pictureBox1);
            this.MaximumSize = new System.Drawing.Size(354, 524);
            this.MinimumSize = new System.Drawing.Size(354, 524);
            this.Name = "loginForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "ReClo ";
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.Button loginBTN;
        private System.Windows.Forms.Label logErrorLB;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label EmailLB;
        private System.Windows.Forms.TextBox passTB;
        private System.Windows.Forms.TextBox emailTB;
    }
}